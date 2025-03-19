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
uniform vec3 uSpotDirection; // Direction the spotlight is pointing
uniform float uSpotCutoff;   // Cutoff angle (as cosine)
uniform float uSpotExponent; // Spotlight focus/concentration

void main() {
  // Normalize vectors
  vec3 normal = normalize(vNormal);
  vec3 lightDirection = normalize(vLightDirection);
  vec3 viewDirection = normalize(vViewDirection);
  vec3 spotDirection = normalize(uSpotDirection);
  
  // Calculate spotlight effect
  float spotDot = dot(-lightDirection, spotDirection);
  float spotEffect = 0.0;
  
  if (spotDot > uSpotCutoff) {
    // Inside the spotlight cone
    spotEffect = pow(spotDot, uSpotExponent);
  }
  
  // Calculate reflection vector
  vec3 reflectionDirection = reflect(-lightDirection, normal);
  
  // Calculate lighting components
  float nDotL = max(dot(normal, lightDirection), 0.0);
  float rDotV = max(dot(reflectionDirection, viewDirection), 0.0);
  
  // Calculate Phong shading components
  vec4 ambient = uAmbientProduct;
  vec4 diffuse = nDotL * uDiffuseProduct * spotEffect;
  vec4 specular = pow(rDotV, uShininess) * uSpecularProduct * float(nDotL > 0.0) * spotEffect;
  
  // Get texture color
  vec4 textureColor = texture2D(uTextureUnit, vTextureCoord);
  
  // Combine lighting with texture
  vec4 lighting = ambient + diffuse + specular;
  
  // Final color is the product of texture and lighting
  gl_FragColor = textureColor * lighting;
}