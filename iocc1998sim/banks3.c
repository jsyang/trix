#include <math.h>
#include <sys/time.h>
#include <X11/Xlib.h>
#include <X11/keysym.h>

double
    L, o, P, tick=dt, T, Z, D=1, d, sceneryZ[999], E, h=8, I, J, K, sceneryY[999], M, m, O,
    sceneryX[999], j=33e-3, altitude=1E3, r, t, u, v, W, S=74.5, l=221, X=7.26, a, B, A=32.2, 
    c, F, H;
   
int N, q, C, sceneryMaxIndex, sceneryIndex, U;
Window window;
char instruments[52];
GC graphicsContext;

main()
{
    // Open a connection to X display server.
    Display* display = XOpenDisplay(0);
    
    // Initialize Window.
    window = RootWindow(display,0);

    // Initialize GC.
    graphicsContext = XCreateGC(display,window,0,0);
    
    // Use black as the default drawing color.
    XSetForeground(display, graphicsContext, BlackPixel(display,0));

    // Load scenery data.
    for
	(
		;
		scanf("%lf%lf%lf",sceneryX+sceneryMaxIndex,sceneryY+sceneryMaxIndex,sceneryZ+sceneryMaxIndex)+1
		;
		sceneryMaxIndex++
	);
    
    // Makes an InputOutput subwindow from the root window previously in "window".
    // Size 400x400, white background.
    window = XCreateSimpleWindow(display,window,0,0,400,400,0,0,WhitePixel(display,0));
    
    // Watch for key press events in window.
    XSelectInput(display, window, KeyPressMask);

	// Maps the window.
	XMapWindow(display,window);

	// Main simulator loop: 
    for(;;)
    {
		// How long do we sleep for?
		// See "select(0,0,0,&G);"
		struct timeval G =
        {
            0,			// seconds
            dt*1e6		// micro-seconds
        };
        
        // 3D transform matrices' cells.
        K = cos(j);     // pitch
        B = sin(j);		// 
        W = cos(O);
        T = sin(O);
        D = cos(o);
        E = sin(o);
        
        // Rearranged the block order (independent.)
        M+= H*tick;
		F+= P*tick;
        Z = D*K;        
        r = E*K;
        
        // 
        m = K*W;
        H = K*T;
        O+= D*tick*F/K + d/K*E*tick;
        
        a = B*T*D - E*W;
        
        t = T*E + D*B*W;
        j+= d*tick*D - tick*F*E;
        P = W*E*B - T*D;
        
		I = D*W + E*T*B;
		o+=( E*d/K*B + v + B/K*F*D )*tick;

        // Make way for the next frame.
        XClearWindow(display,window);

		// Draw all the scenery; moved the initializing N = 1e4 value here.
        for(N=1e4, sceneryIndex=0; sceneryIndex<sceneryMaxIndex;)
        {
            T = sceneryZ[sceneryIndex] + altitude;
            E = c - sceneryY[sceneryIndex];
            D = sceneryX[sceneryIndex] - L;
            K = D*m - B*T - H*E;
            
            W = T*r - I*E + D*P;
            D = t*D + Z*T - a*E;
            
            // Skip delimiter point (0,0,0).
            if(sceneryX[sceneryIndex] + sceneryY[sceneryIndex] + sceneryZ[sceneryIndex]==0 | K < fabs(W) | fabs(D) > K)
            {
                N = 1e4;
            }
            else
            {
                q = W/K*4E2 + 2e2;
                C = 2E2 + 4e2/K*D;
                XDrawLine(display,window,graphicsContext,N,U,q,C);

                N = q;
                U = C;
            }
            
            ++sceneryIndex;
        }

        L+= tick*(X*t + P*M + m*l);
        T = X*X + l*l + M*M;

		// Draw the instruments readout text from the last tick.
        XDrawString(display,window,graphicsContext,20,380,instruments,17);

		D = v/l*15;        
        altitude+= (B*l - M*r - X*Z)*tick;

//-------------- statements remain unchanged beyond this point except for variable names--

        for
        (
            ;
            XPending(display);
            u *= CS!=N
        )
        {
            XEvent event;
            XNextEvent(display,&window);
            
            ++*(
                (N=XLookupKeysym(&event.xkey,0))-IT ?
                    N-LT ?
                        UP-N ?
                            &E
                        :
                            &J
                    :
                        &u
                :
                    &h
            );
            
            --*(
                DN-N ? 
                    N-DT ?
                        N==RT ? 
                            &u
                        :
                            &W
                    :
                        &h
                :
                    &J
            );
        }
        
        m = 15*F/l;
        c+=
        (
            I=M/l,
            l*H + I*M + a*X
        )*tick;
        
        H = A*r + v*X - F*l + (
             E = .1 + X*4.9/l,
             t = T*m/32 - I*T/24
        )/S;
        
        K = F*M + (
             h*1e4/l - (T + E*5*T*E)/3e2
        )/S - X*d - B*A;
        
        a = 2.63/l*d;
        X+= (d*l - T/S*(.19*E + a*.64 + J/1e3) - M*v + A*Z)*tick;
        l+= K*tick;
        W = d;
        
		// Instrument readout: airspeed, compass, altitude.
        sprintf(
            instruments,
            "%5d  %3d" "%7d",
            l/1.7,
            (C=9E3+O*57.3)%0550,
            (int)altitude
        );
        
        d+= T*(.45 - 14/l*X - a*130 - J*.14)*tick/125e2 + F*tick*v;
        P = (T*(47*I - m*52 + E*94*D - t*.38 + u*.21*E)/1e2 + W*179*v)/2312;

		// From http://linux.die.net/man/2/select:
		// Some code calls select() with all three sets empty, n zero, and a non-NULL timeout as a fairly portable way to sleep with subsecond precision.
        select(0,0,0,0,&G);		
		
        v-= (W*F - T*(.63*m - I*.086 + m*E*19 - D*25 - .11*u)/107e2)*tick;
    }
}
