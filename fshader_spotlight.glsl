precision mediump float;

varying vec3 vNormal;
varying vec2 vTextureCoord;
varying vec3 vLightDirection;
varying vec3 vViewDirection;

uniform sampler2D uTextureUnit;
uniform vec4 uAmbientProduct;
uniform vec4 uDiffuseProduct;
uniform vec4 uSpecularProduct;
uniform float uShininess;
uniform vec3 uSpotDirection;
uniform float uSpotCutoff; 
uniform float uSpotExponent;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 lightDirection = normalize(vLightDirection);
  vec3 viewDirection = normalize(vViewDirection);
  vec3 spotDirection = normalize(uSpotDirection);

  float spotDot = dot(-lightDirection, spotDirection);
  float spotEffect = 0.0;

  if (spotDot > uSpotCutoff) {
    spotEffect = pow(spotDot, uSpotExponent);
  }

  vec3 reflectionDirection = reflect(-lightDirection, normal);

  float nDotL = max(dot(normal, lightDirection), 0.0);
  float rDotV = max(dot(reflectionDirection, viewDirection), 0.0);

  vec4 ambient = uAmbientProduct;
  vec4 diffuse = nDotL * uDiffuseProduct * spotEffect;
  vec4 specular = pow(rDotV, uShininess) * uSpecularProduct * float(nDotL > 0.0) * spotEffect;

  vec4 textureColor = texture2D(uTextureUnit, vTextureCoord);

  vec4 lighting = ambient + diffuse + specular;

  gl_FragColor = textureColor * lighting;
}
