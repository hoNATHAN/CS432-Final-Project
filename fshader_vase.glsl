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

void main() {
  // Normalize vectors (they might not be unit length after interpolation)
  vec3 normal = normalize(vNormal);
  vec3 lightDirection = normalize(vLightDirection);
  vec3 viewDirection = normalize(vViewDirection);
  
  // Calculate reflection vector
  vec3 reflectionDirection = reflect(-lightDirection, normal);
  
  // Calculate lighting components
  float nDotL = max(dot(normal, lightDirection), 0.0);
  float rDotV = max(dot(reflectionDirection, viewDirection), 0.0);
  
  // Calculate Phong shading components
  vec4 ambient = uAmbientProduct;
  vec4 diffuse = nDotL * uDiffuseProduct;
  vec4 specular = pow(rDotV, uShininess) * uSpecularProduct * float(nDotL > 0.0);
  
  // Get texture color
  vec4 textureColor = texture2D(uTextureUnit, vTextureCoord);
  
  // Combine lighting with texture
  vec4 lighting = ambient + diffuse + specular;
  
  // Final color is the product of texture and lighting
  gl_FragColor = textureColor * lighting;
}