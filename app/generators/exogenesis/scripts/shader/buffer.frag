precision highp float;
precision highp int;

// ---------------------------------------------------------------- CONSTANTS
#define PI             3.14159265358979323846264
#define TAU            6.28318530717958647692528
#define SQRT_2         1.41421356237309504880169
#define PHI            1.61803398874989484820459
#define E              2.71828182845904523536028

// ---------------------------------------------------------------- VARYINGS
varying vec2 vTexCoord; // UV coordinate from shader.vert

// ---------------------------------------------------------------- UNIFORMS
uniform vec2 resolution;
uniform vec3 mouse;
uniform float progress;
uniform float time;
uniform sampler2D buffer;

uniform float SSIDHash;
uniform bool utilBools[10];

uniform int shapeMode;
uniform float shapeLen;
uniform float rotation;
uniform float displacementAngle;
uniform float displacementDistance;
uniform bool doMirrorX;
uniform bool doMirrorY;
uniform float raySpreading;
uniform float rayCount;
uniform float rayBreaks;

#define nmc(x) (0.5 - 0.5 * cos(x))

float dot2(vec2 v) {
    return dot(v, v);
}

//Segment (https://www.shadertoy.com/view/WtdSDj)
vec3 sdgSegment(in vec2 p, in vec2 a, in vec2 b, in float r) {
    vec2 ba = b - a, pa = p - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    vec2 q = pa - h * ba;
    float d = length(q);
    return vec3(d - r, q / d);
}

// Vesica (intersecting circles) https://iquilezles.org/articles/distgradfunctions2d/
vec3 sdgVesica(vec2 p, float r, float d) {
    vec2 s = sign(p);
    p = abs(p);
    float b = sqrt(r * r - d * d);
    if ((p.y - b) * d > p.x * b) {
        vec2 q = vec2(p.x, p.y - b);
        float l = length(q) * sign(d);
        return vec3(l, s * q / l);
    } else {
        vec2 q = vec2(p.x + d, p.y);
        float l = length(q);
        return vec3(l - r, s * q / l);
    }
}

// Iso triange https ://www.shadertoy.com/view/3dyfDd
vec3 sdgTriangleIsosceles(in vec2 p, in vec2 q) {
    float w = sign(p.x);
    p.x = abs(p.x);
    vec2 a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);
    vec2 b = p - q * vec2(clamp(p.x / q.x, 0.0, 1.0), 1.0);
    float k = sign(q.y);
    float l1 = dot(a, a);
    float l2 = dot(b, b);
    float d = sqrt((l1 < l2) ? l1 : l2);
    vec2 g = (l1 < l2) ? a : b;
    float s = max(k * (p.x * q.y - p.y * q.x), k * (p.y - q.y));
    return vec3(d, vec2(w * g.x, g.y) / d) * sign(s);
}

//vec2 qq(vec2 dir, vec2 q) { return dir; }
vec2 qq(in vec2 dir, in vec2 q) {
    return dir *
        mix(0.5, 1.5, max(0., dot(normalize(dir), q)));
}

vec2 flipUv(in vec2 uv) {
    return uv * vec2(1., -1.) + vec2(0., 1.);
}

vec2 laplacian(in vec2 uv, in vec2 px, in vec2 q, in vec2 curr) {
    const vec3 dir = vec3(1., -1., 0.);
    return 0.25 * mix(( 
    // horizontal-vertical cross
    texture2D(buffer, flipUv(uv + px * qq(dir.xx, q))).xy +
        texture2D(buffer, flipUv(uv + px * qq(dir.xy, q))).xy +
        texture2D(buffer, flipUv(uv + px * qq(dir.yy, q))).xy +
        texture2D(buffer, flipUv(uv + px * qq(dir.yx, q))).xy), ( 
    // corners
    texture2D(buffer, flipUv(uv + px * qq(dir.zx, q))).xy +
        texture2D(buffer, flipUv(uv + px * qq(dir.zy, q))).xy +
        texture2D(buffer, flipUv(uv + px * qq(dir.xz, q))).xy +
        texture2D(buffer, flipUv(uv + px * qq(dir.yz, q))).xy),
    // 0.8 to cross, 0.2 to corners
    0.2) - curr;
}

vec3 computeCol(in vec2 uv, in vec2 pos, in vec2 mousePos) {
    vec2 px = 1. / resolution;

    if (time < 0.1) {
        return vec3(1.);
    }

       // Apply mirroring
    if (doMirrorX) {
        uv.x = uv.x >= 0.5 ? 1. - uv.x : uv.x;
        pos.x = -abs(pos.x);
        mousePos.x = -abs(mousePos.x);
    }
    if (doMirrorY) {
        uv.y = uv.y >= 0.5 ? 1. - uv.y : uv.y;
        pos.y = -abs(pos.y);
        mousePos.y = -abs(mousePos.y);
    }

    vec2 curr = texture2D(buffer, flipUv(uv)).xy;

    vec2 origPos = pos;
    pos *= 5. / 6. * shapeLen + 1.5 / (shapeLen - 1.);

    // // Apply mirroring
    // if (doMirrorX)
    //     pos.x = -abs(pos.x);
    // if (doMirrorY)
    //     pos.y = -abs(pos.y);

    // Apply rotation
    float c = cos(rotation + PI * 0.5);
    float s = sin(rotation + PI * 0.5);
    pos = mat2(c, -s, s, c) * pos;

    //vec2 posDir = (cos(pos * PI * 8. + time)) * mat2(0,-1,1,0);
    vec2 q = vec2(0., 0.);//normalize(posDir);
    vec2 lap = laplacian(uv, px, q, curr);

    vec3 col;

    vec2 deltaPos = 0.2 * displacementDistance * sin(pos * TAU + displacementAngle);
    vec2 sdgPos = (pos + deltaPos).yx;
    vec3 sdg;
    if (shapeMode == 0) {
        sdg = sdgSegment(sdgPos, vec2(0., -shapeLen * 0.5), vec2(0., shapeLen * 0.5), 0.);
    } else if (shapeMode == 1) {
        float rv = 0.5 + shapeLen / 10.;//shapeLen / 2.;
        float dv = shapeLen;
        sdg = sdgVesica(sdgPos, rv, -dv + rv * 4.);
        sdg.x += 0.1;
    } else {
        vec2 triSize = vec2(shapeLen * 0.5, -shapeLen / 3.);
        sdg = sdgTriangleIsosceles(sdgPos - vec2(0., triSize.y * -0.5), triSize);
    }

    float sd = sdg.x;
    vec2 grad = sdg.yz;

    vec2 comp = vec2(dot(vec2(1., 0.), grad), dot(vec2(0., 1.), grad));

    //float th = mod(atan(grad.y, grad.x), TAU);
    float th = mod(atan(pos.y, pos.x), TAU);
    float r = length(pos);
    //////////////// vars end

    sd = abs(sd - 0.5) + 0.15;

    float f = nmc(sd * rayBreaks * TAU) * 0.9 - abs(sd) * 0.81;

    //th = nmc(nmc(nmc(th * 0.5) * PI) * PI) * TAU;
    float thSpread = mix(th, nmc(nmc(th * 0.5) * PI) * TAU, raySpreading);
    ;
    float k = nmc(thSpread * rayCount) * 0.8 - abs(sd) * 0.515 + (-1. / (r * r + 0.15)) * 0.1;

    if (sd > 1.)
        f *= 0.;// / (sd - 0.0);

    float xy2 = curr.x * curr.y * curr.y;
    vec2 delta = vec2(1.5 * lap.x - xy2 + f * (1. - curr.x), 1.5 * lap.y + xy2 - (curr.y) * (k + f));

    vec2 new = curr + delta * 0.5;

    // if (mouse.z > 0. && distance(mousePos, origPos) < 0.1)
    //     new = vec2(1., 1.);
    // if (mouse.z > 0.)
    new += exp(-distance(mousePos, origPos) * 12.);

    new = clamp(new, 0., 1.);

    col = vec3(new, 0.);

    return col;
}

// ---------------------------------------------------------------- MAIN
void main() {
    // vec2 uv = vTexCoord.xy;
    vec2 uv = gl_FragCoord.xy / resolution;
    vec2 pos = (gl_FragCoord.xy - resolution * 0.5) / resolution * 2.;
    vec2 mousePos = (mouse.xy - resolution * 0.5) / resolution * 2.;
    gl_FragColor = vec4(computeCol(uv, pos, mousePos), 1.);
}