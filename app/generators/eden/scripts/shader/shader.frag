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

uniform float threshold;
uniform float eps;

// ---------------------------------------------------------------- MAIN

#define BG vec3(1.)
#define FG vec3(0.)

void main() {
	vec2 uv = gl_FragCoord.xy / resolution;

	// if (mouse.z == 1.) {
	// 	gl_FragColor = texture2D(buffer, uv);
	// 	return;
	// }

	vec2 xy = texture2D(buffer, uv).xy;
	float v = xy.x - xy.y;
	v = v * 0.5 + 0.5;

	v = smoothstep(threshold - eps, threshold + eps, v);

	vec3 col = mix(BG, FG, v);

	gl_FragColor = vec4(col, 1.);
}
