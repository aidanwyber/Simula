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

//vec2 qq(vec2 dir, vec2 q) { return dir; }
vec2 qq(in vec2 dir, in vec2 q) {
    return dir *
        mix(0.5, 1.5, max(0., dot(normalize(dir), q)));
}
vec2 laplacian(in vec2 uv, in vec2 px, in vec2 q, in vec2 curr) {
    const vec3 dir = vec3(1., -1., 0.);
    return 0.25 * mix(( // horizontal-vertical cross
    texture2D(buffer, uv + px * qq(dir.xx, q)).xy +
        texture2D(buffer, uv + px * qq(dir.xy, q)).xy +
        texture2D(buffer, uv + px * qq(dir.yy, q)).xy +
        texture2D(buffer, uv + px * qq(dir.yx, q)).xy), ( // corners
    texture2D(buffer, uv + px * qq(dir.zx, q)).xy +
        texture2D(buffer, uv + px * qq(dir.zy, q)).xy +
        texture2D(buffer, uv + px * qq(dir.xz, q)).xy +
        texture2D(buffer, uv + px * qq(dir.yz, q)).xy), 0.2 // 0.8 to cross, 0.2 to corners
    ) - curr;
}

vec3 computeCol(in vec2 uv, in vec2 pos) {
    vec2 px = 1. / resolution;

    //uv.x = uv.x >= 0.5 ? 1. - uv.x : uv.x; // mirror

    vec2 curr = uv;// texture2D(buffer, uv).xy;

    pos *= 3.;

    //vec2 posDir = (cos(pos * PI * 8. + time)) * mat2(0,-1,1,0);
    vec2 q = vec2(0., 0.);//normalize(posDir);
    vec2 lap = laplacian(uv, px, q, curr);

    vec3 col;

    float len = 6.;

    vec2 dpos = 1. * cos(pos * TAU + time * 0.1) * 0.2;
    vec3 sdg = sdgSegment((pos + dpos).yx, vec2(0., -len * 0.5), vec2(0., len * 0.5), 0.);

    float sd = sdg.x;
    vec2 grad = sdg.yz;

    vec2 comp = vec2(dot(vec2(1., 0.), grad), dot(vec2(0., 1.), grad));

    //float th = mod(atan(grad.y, grad.x), TAU);
    float th = mod(atan(pos.y, pos.x), TAU);
    float r = length(pos);
    //////////////// vars end

    sd = abs(sd - 0.5) + 0.15;

    float radialFreq = 3.;
    float angularFreq = 11.;
    float qpos = 1.;//dot(vec2(1., 1.), sin(grad * TAU * 1.));
    float f = nmc(sd * radialFreq * TAU * mix(qpos, 1., 0.9)) * 0.9 - abs(sd) * 0.81;

    //th = nmc(nmc(nmc(th * 0.5) * PI) * PI) * TAU;
    th = nmc(nmc(th * 0.5) * PI) * TAU;
    float k = nmc(th * angularFreq) * 0.8 - abs(sd) * 0.515 + (-1. / (r * r + 0.15)) * 0.1;

    if (sd > 1.)
        f *= 0.;// / (sd - 0.0);

    float xy2 = curr.x * curr.y * curr.y;
    vec2 delta = vec2(1.5 * lap.x - xy2 + f * (1. - curr.x), 1.5 * lap.y + xy2 - (curr.y) * (k + f));

    vec2 new = curr + delta * 0.1;

    if (mouse.z > 0.)
        // new = vec2(1., 1.);
        new += vec2(1.) * 0.01 / (dot2(uv - mouse.xy / resolution));

    new = clamp(new, 0., 1.);

    col = vec3(new, 0.);

    return col;
}

// ---------------------------------------------------------------- MAIN
void main() {
    // vec2 uv = vTexCoord.xy;
    vec2 uv = gl_FragCoord.xy / resolution;
    vec2 pos = (gl_FragCoord.xy - resolution * 0.5) / resolution * 2.;
    gl_FragColor = vec4(computeCol(uv, pos), 1.);
}