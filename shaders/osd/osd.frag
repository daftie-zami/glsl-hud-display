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

// Font texture for text rendering
layout(binding = 1) uniform sampler2D fontTex;

#define PI 3.1415926535897932384626433832795

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
// TEXT DRAWING FUNCTIONS
// ============================================

// Set to the sampler containing the alphabet texture
#define FONT_TEXTURE fontTex

// Horizontal character spacing (default: 0.5)
#define CHAR_SPACING 0.44

// Create a basic string
#define makeStr(func_name) float func_name(vec2 u) { _print 

// Create a string with an int parameter
#define makeStr1i(func_name) float func_name(vec2 u, int i) { _print

// Create a string with a float parameter
#define makeStr1f(func_name) float func_name(vec2 u, float i) { _print

// Create a string with two floats parameter
#define makeStr2f(func_name) float func_name(vec2 u, float i, float j) { _print

// ... Or create your own strings with any parameters
#define makeStrXX(func_name) float func_name(vec2 u, ...) { _print

// Terminate a string
#define _end    ); return d; }

// Dynamic uppercase character
// i: [0-25]
#define _ch(i)  _ 65+int(i)

// Dynamic digit
// i: [0-9]
#define _dig(i) _ 48+int(i)

// Floating point debug
// x:   value to print
// dec: number of decimal places to print
#define _dec(x, dec) ); d += _decimal(FONT_TEXTURE, u, x, dec); (0

// Uppercase letters (65-90)
#define _A _ 65
#define _B _ 66
#define _C _ 67
#define _D _ 68
#define _E _ 69
#define _F _ 70
#define _G _ 71
#define _H _ 72
#define _I _ 73
#define _J _ 74
#define _K _ 75
#define _L _ 76
#define _M _ 77
#define _N _ 78
#define _O _ 79
#define _P _ 80
#define _Q _ 81
#define _R _ 82
#define _S _ 83
#define _T _ 84
#define _U _ 85
#define _V _ 86
#define _W _ 87
#define _X _ 88
#define _Y _ 89
#define _Z _ 90

// Lowercase letters (97-122)
#define _a _ 97
#define _b _ 98
#define _c _ 99
#define _d _ 100
#define _e _ 101
#define _f _ 102
#define _g _ 103
#define _h _ 104
#define _i _ 105
#define _j _ 106
#define _k _ 107
#define _l _ 108
#define _m _ 109
#define _n _ 110
#define _o _ 111
#define _p _ 112
#define _q _ 113
#define _r _ 114
#define _s _ 115
#define _t _ 116
#define _u _ 117
#define _v _ 118
#define _w _ 119
#define _x _ 120
#define _y _ 121
#define _z _ 122

// Digits (48-57)
#define _0 _ 48
#define _1 _ 49
#define _2 _ 50
#define _3 _ 51
#define _4 _ 52
#define _5 _ 53
#define _6 _ 54
#define _7 _ 55
#define _8 _ 56
#define _9 _ 57

// Special characters
#define __ _ 32      // Space (double underscore for easy typing)
#define _SPC _ 32    // Space
#define _SUB _ 45    // Minus/Subtraction sign -
#define _DOT _ 46    // Period/Dot .
#define _COM _ 44    // Comma ,
#define _COL _ 58    // Colon :
#define _EXC _ 33    // Exclamation mark !
#define _QUE _ 63    // Question mark ?
#define _NUM _ 35    // Number sign #
#define _MUL _ 42    // Multiply *
#define _DIV _ 47    // Divide /
#define _ADD _ 43    // Plus +
#define _AT _ 64     // At sign @
#define _UND _ 95    // Underscore _
#define _EQU _ 61    // Equals =
#define _LT _ 60     // Less than <
#define _GT _ 62     // Greater than >
#define _LPA _ 40    // Left parenthesis (
#define _RPA _ 41    // Right parenthesis )
#define _LBR _ 91    // Left bracket [
#define _RBR _ 93    // Right bracket ]
#define _PER _ 37    // Percent %
#define _AMP _ 38    // Ampersand &
#define _SQT _ 39    // Single quote '
#define _DQT _ 34    // Double quote "

#define _print  float d = 0.; (u.x += CHAR_SPACING
#define _       ); u.x -= CHAR_SPACING; d += _char(FONT_TEXTURE, u,

// Print character
float _char(sampler2D s, vec2 u, int id) {
    vec2 p = vec2(id%16, floor(float(id)/16.)); // Column and row from top
         p = (u + p) / 16.;
         // No Y flip - texture starts from top
         u = step(abs(u-.5), vec2(.5));
    return texture(s, p).r * u.x * u.y;
}

// Floating point debug
float _decimal(sampler2D FONT_TEXTURE, inout vec2 u, float n, int decimals) {
    float d = 0., N = 1.; // d is the final color, N the number of digits before the decimal

    if (n < 0.) {  // If the number is negative
        n *= -1.;  // Make it positive
        (0 _SUB ); // Print a minus sign
    }
    
    // Calculate the number of digits before the decimal point
    for (float x = n; x >= 10.; x /= 10.) N++;

    // Print the digits before the decimal point
    for (float i = 0.; i < N; i++) {        
        float magnitude = pow(10., N-i-1.);
        float leftDigit = floor(n / magnitude);
        n -= leftDigit * magnitude;
        
        (0 _dig(leftDigit) );
    }

    (0 _DOT ); // Print a dot
    
    // Print the digits after the decimal point
    for (int i = 0; i < decimals; i++) {
        float firstDecimal = floor((n - floor(n)) * 10.);
        n *= 10.;
        
        (0 _dig(firstDecimal) );
    }
    
    return d;
}

// ============================================
// YAW BRACKET
// ============================================

float yawBracket(vec2 st)
{
    float r = 0.003;
    float line = 0.0;

    float bx = 0.310;
    float by = -0.43;

    line = max(line, roundedLine(
        st,
        vec2(bx, by),
        vec2(bx, by - 0.02),
        r
    ));

    line = max(line, roundedLine(
        st,
        vec2(bx, by),
        vec2(bx + 0.05, by + 0.05),
        r
    ));
    
    line = max(line, roundedLine(
        st,
        vec2(-bx, by),
        vec2(-bx, by - 0.02),
        r
    ));

    line = max(line, roundedLine(
        st,
        vec2(-bx, by),
        vec2(-bx - 0.05, by + 0.05),
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

    float baseY = -0.43;

    line = max(line, hLineR(st, baseY, -0.3, 0.3, r));
    line = max(line, vLineR(st, 0.0, baseY - 0.025, baseY - 0.05, r));

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
                baseY + h,
                baseY + 0.005,
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
    float by = 0.37;

    line = max(line, roundedLine(
        st,
        vec2(-bx, -by),
        vec2(-bx, -by + 0.04),
        r
    ));
    
    line = max(line, roundedLine(
        st,
        vec2(-bx, -by),
        vec2(-bx + 0.04, -by - 0.02),
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

    vec2 p = rotate2D(st, -roll);

    shape = max(shape, arc(
        p,
        vec2(0.0, 0.0),
        0.01,
        r,
        PI * 0.2,
        PI * 1.8
    ));
    
    shape = max(shape, vLineR(p, 0.0, -0.015,  -0.03 , r));
    shape = max(shape, hLineR(p, 0.0, -0.015,  -0.030, r));
    shape = max(shape, hLineR(p, 0.0,  0.015,   0.030, r));
    shape = max(shape, vLineR(p, 0.0,  0.000,   0.015, r));
    shape = max(shape, vLineR(p, 0.0,  0.0225,  0.03 , r));
    
    return shape;
}

// ============================================
// AIRSPEED/ALTITUDE LADDER
// ============================================

float as_altLadder(vec2 st, float value)
{
    float r = 0.002;
    float line = 0.0;

    float baseY = -0.795;

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
                baseY + h,
                baseY + 0.005,
                r
            ) * alpha;

        line = max(line, tick);
    }

    // Mask box area
    float boxMask = roundBoxMask(
        vec2(st.x + 0.75, st.y),
        vec2(0.1, 0.05),
        0.01
    );

    // Clear lines inside box
    line *= (1.0 - boxMask);

    // Draw box and bracket on top
    line = max(line,
        roundBoxStroke(
            vec2(st.x + 0.75, st.y),
            vec2(0.1, 0.05),
            0.01,
            0.002
        )
    );

    line = max(line, as_altBracket(st));
    line = max(line, as_altBracket(vec2(st.x, -st.y)));

    float textScale = 0.03;
    vec2 uv = (st - vec2(-0.72, 0.36)) / textScale;
    line = max(line, _decimal(fontTex, uv, value, 1));

    return line;
}

// ============================================
// TELEMETRY OVERLAY
// ============================================

float telemetryOverlay(vec2 st)
{
    float r = 0.003;
    float shape = 0.0;
    
    float bx = 0.6;
    float by = 0.42;

    shape = max(shape, roundedLine(
        st,
        vec2(bx, by),
        vec2(bx + 0.1, by + 0.08),
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
        vec2(-bx - 0.1, by + 0.08),
        r
    ));
    
    return shape;
}

// ============================================
// MAIN
// ============================================

void main()
{
    vec2 st = qt_TexCoord0;
    st -= 0.5;
    st.x *= iResolution.x / iResolution.y;

    vec3 color = vec3(0.0);
    
    // HUD colors
    vec3 hudTint = hudColor.rgb;

    vec2 fontUV = st * 2.0 + 0.5; // Scale and center the texture
    if (fontUV.x >= 0.0 && fontUV.x <= 1.0 && fontUV.y >= 0.0 && fontUV.y <= 1.0) {
        float fontSample = texture(fontTex, fontUV).r;
        color += hudTint * fontSample;
    }

    float hud = 0.0;

    hud = max(hud, as_altLadder(st, speed));
    hud = max(hud, as_altLadder(vec2(-st.x, st.y), altitude));
    hud = max(hud, compassTape(st, yaw)); 
    hud = max(hud, crossHair(st, radians(roll)));
    hud = max(hud, telemetryOverlay(st));

    float phase = iTime * 0.03 * sin(iTime * 0.5) * 0.005;
    hud = max(hud, dottedCircle(st, 0.125, phase));

    color += hudTint * hud;

    float alpha = max(max(color.r, color.g), color.b);
    fragColor = vec4(color, alpha * qt_Opacity);
}

