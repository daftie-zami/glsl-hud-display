#version 440

layout(location = 0) in vec2 qt_TexCoord0;
layout(location = 0) out vec4 fragColor;

layout(std140, binding = 0) uniform buf {
    mat4 qt_Matrix;
    float qt_Opacity;
    float iTime;
    float yaw;
    float pitch;
    float roll;
    float speed;
    float altitude;
    vec2 iResolution;
    vec2 padding;
    vec4 hudColor;
};

layout(binding = 1) uniform sampler2D fontAtlas;

#define PI 3.1415926535897932384626433832795

// ============================================
// MSDF RENDERING
// ============================================

// Median function for MSDF sampling
float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

// Draw a single MSDF character at given UV
float drawMSDF(vec2 uv, float pxRange)
{
    vec3 msd = texture(fontAtlas, uv).rgb;
    float sd = median(msd.r, msd.g, msd.b) - 0.5;
    float screenPxDist = sd * pxRange;
    return clamp(screenPxDist + 0.5, 0.0, 1.0);
}

// MSDF with glow effect for HUD aesthetic
vec3 drawMSDFGlow(vec2 uv, float pxRange, vec3 textColor, vec3 glowColor)
{
    vec3 msd = texture(fontAtlas, uv).rgb;
    float sd = median(msd.r, msd.g, msd.b) - 0.5;
    float screenPxDist = sd * pxRange;
    
    float alpha = clamp(screenPxDist + 0.5, 0.0, 1.0);
    float glow = smoothstep(0.2, 0.0, abs(sd)) * 0.6;
    
    vec3 color = textColor * alpha;
    color += glowColor * glow;
    
    return color;
}

// ============================================
// DISTANCE & DRAWING FUNCTIONS
// ============================================

float sdSegment(vec2 p, vec2 a, vec2 b)
{
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

float circleMask(vec2 p, float radius, float feather)
{
    float d = length(p);
    return 1.0 - smoothstep(radius - feather, radius + feather, d);
}

float rectMask(vec2 p, vec2 halfSize, float feather)
{
    vec2 d = abs(p) - halfSize;
    float outside = length(max(d, 0.0));
    float inside  = min(max(d.x, d.y), 0.0);

    float dist = outside + inside;
    return 1.0 - smoothstep(0.0, feather, dist);
}

float roundedLine(vec2 st, vec2 a, vec2 b, float r)
{
    float d = sdSegment(st, a, b);
    return smoothstep(r, r - 0.0015, d);
}

float vLineR(vec2 st, float x, float y0, float y1, float r)
{
    return roundedLine(st, vec2(x, y0), vec2(x, y1), r);
} 

float hLineR(vec2 st, float y, float x0, float x1, float r)
{
    return roundedLine(st, vec2(x0, y), vec2(x1, y), r);
}

float sdRoundBox(vec2 p, vec2 b, float r)
{
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float roundBoxMask(vec2 st, vec2 size, float r)
{
    float d = sdRoundBox(st, size * 0.5, r);
    return step(d, 0.0);   // içi 1, dışı 0
}

float roundBoxStroke(vec2 st, vec2 size, float r, float t)
{
    float d = sdRoundBox(st, size * 0.5, r);
    return smoothstep(t, t - 0.0015, abs(d));
}

vec2 rotate2D(vec2 p, float a)
{
    float s = sin(a);
    float c = cos(a);
    return vec2(
        c * p.x - s * p.y,
        s * p.x + c * p.y
    );
}

// ============================================
// YAW BRACKET
// ============================================

float yawBracket(vec2 st)
{
    float r = 0.003;
    float line = 0.0;

    float bx = 0.310;
    float by = 0.43;

    line = max(line, roundedLine(
        st,
        vec2(bx, by),
        vec2(bx, by + 0.02),
        r
    ));

    line = max(line, roundedLine(
        st,
        vec2(bx, by),
        vec2(bx + 0.05, by - 0.05),
        r
    ));
    
    line = max(line, roundedLine(
        st,
        vec2(-bx, by),
        vec2(-bx, by + 0.02),
        r
    ));

    line = max(line, roundedLine(
        st,
        vec2(-bx, by),
        vec2(-bx - 0.05, by - 0.05),
        r
    ));

    return line;
}

// ============================================
// COMPASS TAPE
// ============================================

float compassTape(vec2 st, float yawDegrees)
{
    float r = 0.002;
    float line = 0.0;

    float baseY = 0.43;

    line = max(line, hLineR(st, baseY, -0.3, 0.3, r));
    line = max(line, vLineR(st, 0.0, baseY  + 0.025, baseY + 0.05, r));

    const int TICKS = 30;
    float spacing = 0.05;
    
    // Normalize yaw for scrolling effect
    float normalizedYaw = mod(yawDegrees, 360.0) / 360.0;
    float offset = mod(normalizedYaw * spacing * 72.0, spacing * 2.0);

    for (int i = -TICKS/2; i <= TICKS/2; i++)
    {
        float x = float(i) * spacing - offset;
        if (abs(x) > 0.3001) continue;

        bool minor = (abs(i) % 2 == 1);

        float h = minor ? 0.015 : 0.02;
        float alpha = minor ? 0.45 : 1.0;

        float tick =
            vLineR(
                st,
                x,
                baseY - h,
                baseY - 0.005,
                r
            ) * alpha;

        line = max(line, tick);
    }
    
    line = max(line, yawBracket(st));
    return line;
}

// ============================================
// ARC DRAWING
// ============================================

float arc(vec2 st, vec2 center, float radius, float thickness, float a0, float a1)
{
    vec2 p = st - center;

    float ang = atan(p.y, p.x) - PI * 1.5;
    ang = mod(ang + 2.0 * PI, 2.0 * PI);

    float dAng = step(a0, ang) * step(ang, a1);

    float dRad = abs(length(p) - radius);

    float line = smoothstep(thickness, thickness - 0.0015, dRad);

    return line * dAng;
}

// ============================================
// ROTATING DOTTED CIRCLE
// ============================================

float dottedCircle(
    vec2 st,
    float radius,
    float phase
){
    float r  = 0.002;
    float aa = 0.001;

    float dots = 36.0;
    float dotSize = 0.6;

    float d = length(st);

    float ring =
        smoothstep(radius - r - aa, radius - r + aa, d) *
        (1.0 - smoothstep(radius + r - aa, radius + r + aa, d));

    float ang = atan(st.y, st.x);
    float a = (ang + PI) / (2.0 * PI);

    float seg = fract((a + phase) * dots);

    float dotMask = smoothstep(dotSize, dotSize - 0.25, seg);

    return ring * dotMask;
}

// ============================================
// ALT BRACKET
// ============================================

float as_altBracket(vec2 st)
{
    float r = 0.003;
    float line = 0.0;

    float bx = 0.8;
    float by = -0.37;

    line = max(line, roundedLine(
        st,
        vec2(bx, by),
        vec2(bx, by + 0.04),
        r
    ));

    line = max(line, roundedLine(
        st,
        vec2(bx, by),
        vec2(bx - 0.04, by - 0.02),
        r
    ));
    
    line = max(line, roundedLine(
        st,
        vec2(-bx, -by),
        vec2(-bx, -by - 0.04),
        r
    ));
    
    line = max(line, roundedLine(
        st,
        vec2(-bx, -by),
        vec2(-bx + 0.04, -by + 0.02),
        r
    ));

    return line;
}

// ============================================
// CROSSHAIR
// ============================================

float crossHair(vec2 st, float roll)
{
    float r = 0.002;
    float shape = 0.0;

    vec2 p = rotate2D(st, roll);

    shape = max(shape, arc(
        p,
        vec2(0.0, 0.0),
        0.01,
        r,
        PI * 0.2,
        PI * 1.8
    ));
    
    shape = max(shape, vLineR(p, 0.0,  0.015,   0.03 , r));
    shape = max(shape, hLineR(p, 0.0, -0.015,  -0.030, r));
    shape = max(shape, hLineR(p, 0.0,  0.015,   0.030, r));
    shape = max(shape, vLineR(p, 0.0,  0.000,  -0.015, r));
    shape = max(shape, vLineR(p, 0.0, -0.0225, -0.03 , r));
    
    return shape;
}

// ============================================
// AIRSPEED/ALTITUDE LADDER
// ============================================

float as_altLadder(vec2 st, float value)
{
    float r = 0.002;
    float line = 0.0;

    float baseY = 0.795;

    const int TICKS = 30;
    float spacing = 0.05;
    
    // Normalize value to create smooth scrolling effect
    // Use modulo to wrap around and create infinite scroll illusion
    float normalizedValue = value / 100.0; // Scale down for smoother motion
    float offset = mod(normalizedValue * spacing, spacing * 2.0);

    for (int i = -TICKS/2; i <= TICKS/2; i++)
    {
        float x = float(i) * spacing - offset;
        if (abs(x) > 0.3501) continue;

        bool minor = (abs(i) % 2 == 1);

        float h = minor ? 0.015 : 0.02;
        float alpha = minor ? 0.45 : 1.0;

        float tick =
            hLineR(
                st,
                x,
                baseY - h,
                baseY - 0.005,
                r
            ) * alpha;

        line = max(line, tick);
    }

    // Mask box area
    float boxMask = roundBoxMask(
        vec2(st.x - 0.75, st.y),
        vec2(0.1, 0.05),
        0.01
    );

    // Clear lines inside box
    line *= (1.0 - boxMask);

    // Draw box and bracket on top
    line = max(line,
        roundBoxStroke(
            vec2(st.x - 0.75, st.y),
            vec2(0.1, 0.05),
            0.01,
            0.002
        )
    );

    line = max(line, as_altBracket(st));
    line = max(line, as_altBracket(vec2(-st.x, st.y)));

    return line;
}

// ============================================
// PITCH LADDER
// ============================================

float pitchLadder(vec2 st, float pitch, float roll)
{
    float r = 0.002;
    float shape = 0.0;

    const int STEPS = 4;
    float spacing = 0.2;

    float stepAngle = radians(10.0);
    float pitchOffset = pitch / stepAngle;

    vec2 p = rotate2D(st, roll);

    for (int i = -STEPS/2; i <= STEPS/2; i++)
    {
        float y = (float(i) - pitchOffset) * spacing;

        shape = max(shape,
            hLineR(p, y, -0.40, -0.1, r)
        );

        shape = max(shape,
            hLineR(p, y,  0.1,  0.40, r)
        );
    }

    float mask = rectMask(
        st,
        vec2(0.5, 0.3),
        0.00
    );

    return shape * mask;
}

// ============================================
// TELEMETRY OVERLAY
// ============================================

float telemetryOverlay(vec2 st)
{
    float r = 0.003;
    float shape = 0.0;
    
    float bx = 0.6;
    float by = -0.42;

    shape = max(shape, roundedLine(
        st,
        vec2(bx, by),
        vec2(bx + 0.1, by - 0.08),
        r
    ));

    shape = max(shape, roundedLine(
        st,
        vec2(bx, by),
        vec2(-bx, by),
        r
    ));

    shape = max(shape, roundedLine(
        st,
        vec2(-bx, by),
        vec2(-bx - 0.1, by - 0.08),
        r
    ));
    
    return shape;
}

// ============================================
// MSDF TEXT RENDERING
// ============================================

// Render digit (0-9) using MSDF atlas
vec3 renderDigit(vec2 st, vec2 pos, float digit, float scale, vec3 textColor, vec3 glowColor)
{
    int d = int(mod(digit, 10.0));
    
    // Atlas coords from audiowide.json (bottom-left origin, pixels)
    vec4 atlasCoords[10];
    atlasCoords[0] = vec4(193.5, 302.5, 254.5, 356.5); // 0
    atlasCoords[1] = vec4(255.5, 302.5, 279.5, 356.5); // 1
    atlasCoords[2] = vec4(280.5, 302.5, 330.5, 356.5); // 2
    atlasCoords[3] = vec4(331.5, 302.5, 377.5, 356.5); // 3
    atlasCoords[4] = vec4(378.5, 302.5, 428.5, 356.5); // 4
    atlasCoords[5] = vec4(0.5, 247.5, 50.5, 301.5);    // 5
    atlasCoords[6] = vec4(97.5, 247.5, 147.5, 301.5);  // 6
    atlasCoords[7] = vec4(253.5, 247.5, 299.5, 301.5); // 7
    atlasCoords[8] = vec4(347.5, 247.5, 397.5, 301.5); // 8
    atlasCoords[9] = vec4(217.5, 192.5, 267.5, 246.5); // 9
    
    // Advance values (normalized units)
    float advances[10];
    advances[0] = 0.92529296875;  // 0
    advances[1] = 0.3544921875;   // 1
    advances[2] = 0.75244140625;  // 2
    advances[3] = 0.71923828125;  // 3
    advances[4] = 0.7734375;      // 4
    advances[5] = 0.75048828125;  // 5
    advances[6] = 0.744140625;    // 6
    advances[7] = 0.64111328125;  // 7
    advances[8] = 0.74609375;     // 8
    advances[9] = 0.744140625;    // 9
    
    vec4 coords = atlasCoords[d];
    
    vec2 charSize = vec2(coords.z - coords.x, coords.w - coords.y);
    vec2 screenSize = charSize * scale;
    vec2 localPos = st - pos;
    
    // Check bounds
    if (localPos.x < 0.0 || localPos.x > screenSize.x || 
        abs(localPos.y) > screenSize.y * 0.5) {
        return vec3(0.0);
    }
    
    // Map to character space (0-1)
    vec2 t = vec2(localPos.x / screenSize.x, (localPos.y / screenSize.y) + 0.5);
    t.y = 1.0 - t.y; // Flip Y for atlas coords
    
    // Calculate atlas UV
    vec2 uv = vec2(
        mix(coords.x, coords.z, t.x) / 488.0,
        mix(coords.y, coords.w, t.y) / 488.0
    );
    
    return drawMSDFGlow(uv, 8.0, textColor, glowColor);
}

// Get digit advance width
float getDigitAdvance(float digit, float scale)
{
    int d = int(mod(digit, 10.0));
    
    float advances[10];
    advances[0] = 0.92529296875;  // 0
    advances[1] = 0.3544921875;   // 1
    advances[2] = 0.75244140625;  // 2
    advances[3] = 0.71923828125;  // 3
    advances[4] = 0.7734375;      // 4
    advances[5] = 0.75048828125;  // 5
    advances[6] = 0.744140625;    // 6
    advances[7] = 0.64111328125;  // 7
    advances[8] = 0.74609375;     // 8
    advances[9] = 0.744140625;    // 9
    
    return advances[d] * 64.0 * scale; // Scale by emSize (64px)
}

// Render integer number at position
vec3 renderNumber(vec2 st, vec2 pos, float value, float scale, vec3 textColor, vec3 glowColor)
{
    vec3 color = vec3(0.0);
    
    int num = int(abs(value));
    int digits = 1;
    
    // Count digits
    if (num >= 10) digits = 2;
    if (num >= 100) digits = 3;
    if (num >= 1000) digits = 4;
    if (num >= 10000) digits = 5;
    
    // Calculate width for right-alignment
    float totalWidth = 0.0;
    int tempNum = num;
    for (int i = 0; i < 5; i++) {
        if (i >= digits) break;
        float digit = mod(float(tempNum), 10.0);
        totalWidth += getDigitAdvance(digit, scale);
        tempNum /= 10;
    }
    
    vec2 currentPos = pos - vec2(totalWidth, 0.0); // Right-align
    
    // Draw digits left to right
    tempNum = num;
    int divisor = 1;
    for (int i = 1; i < digits; i++) {
        divisor *= 10;
    }
    
    for (int i = 0; i < 5; i++) {
        if (i >= digits) break;
        
        float digit = mod(float(tempNum / divisor), 10.0);
        
        color += renderDigit(st, currentPos, digit, scale, textColor, glowColor);
        
        currentPos.x += getDigitAdvance(digit, scale);
        divisor /= 10;
    }
    
    return color;
}

// ============================================
// MAIN
// ============================================

void main()
{
    vec2 st = qt_TexCoord0;
    st -= 0.5;
    st.y = -st.y;
    st.x *= iResolution.x / iResolution.y;

    vec3 color = vec3(0.0);
    
    // HUD colors
    vec3 hudTint = hudColor.rgb;
    vec3 glowColor = hudTint * 0.5;

    float hud = 0.0;

    hud = max(hud, as_altLadder(st, speed));
    hud = max(hud, as_altLadder(vec2(-st.x, st.y), altitude));
    hud = max(hud, compassTape(st, yaw));
    hud = max(hud, crossHair(st, radians(roll)));
    hud = max(hud, telemetryOverlay(st));

    float phase = iTime * 0.03 * sin(iTime * 0.5) * 0.005;
    hud = max(hud, dottedCircle(st, 0.125, phase));

    color += hudTint * hud;
    
    // Text scale for consistent sizing
    float textScale = 0.0008;
    
    // Speed display (right side, middle)
    color += renderNumber(
        st, 
        vec2(0.82, 0.0), 
        speed, 
        textScale, 
        hudTint * 2.0,
        glowColor
    );
    
    // Altitude display (left side, middle)
    color += renderNumber(
        st, 
        vec2(-0.72, 0.0), 
        altitude, 
        textScale, 
        hudTint * 2.0,
        glowColor
    );
    
    // Yaw display (top center)
    color += renderNumber(
        st, 
        vec2(0.05, 0.38), 
        yaw, 
        textScale * 0.75,
        hudTint * 2.0,
        glowColor
    );

    float alpha = max(max(color.r, color.g), color.b);
    fragColor = vec4(color, alpha * qt_Opacity);
}

