import { Link, Outlet, useNavigate } from 'react-router-dom';
import { RippleButton, RippleButtonRipples } from "@/components/animate-ui/primitives/buttons/ripple";
import { HexagonBackground } from '@/components/animate-ui/components/backgrounds/hexagon';
import LightRays from '@/components/LightRays';
import StaggeredMenu from '@/components/StaggeredMenu';
import { confirmLogoutPopup, showLogoutSuccess } from "@/lib/authAlerts";

function NavBar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = async () => {
    const confirmed = await confirmLogoutPopup();
    if (!confirmed) return;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('marketplaceLikedListings');
    localStorage.removeItem('marketplacePurchases');
    localStorage.removeItem('purchasedMarketplaceListingIds');
    localStorage.removeItem('sellerMarketplaceListings');
    await showLogoutSuccess();
    navigate('/');
  };

  const mobileMenuItems = token
    ? [
        { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
        { label: 'Market', ariaLabel: 'Open marketplace', link: '/market' },
        { label: 'Valuation', ariaLabel: 'Open AI valuation', link: '/worth' },
        { label: 'Dashboard', ariaLabel: 'Open dashboard', link: '/dashboard' },
        { label: 'Profile', ariaLabel: 'Open profile', link: '/profile' },
        { label: 'Logout', ariaLabel: 'Logout from your account', onClick: handleLogout },
      ]
    : [
        { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
        { label: 'Login', ariaLabel: 'Open login page', link: '/login' },
        { label: 'Signup', ariaLabel: 'Open signup page', link: '/signup' },
      ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 hidden justify-center lg:flex">
        <div className="mx-3 mt-3 flex h-14 w-full max-w-4xl items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 shadow-lg backdrop-blur-md sm:mx-4 sm:mt-4 sm:px-5">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 primary-gradient-bg rounded-md flex items-center justify-center transform group-hover:rotate-12 transition-all">
              <span className="material-symbols-outlined text-black font-bold text-sm">bolt</span>
            </div>
            <span className="font-headline text-base font-black tracking-tighter text-on-surface sm:text-lg">
              KINETIC<span className="text-primary italic">VAULT</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          {token && (
            <nav className="flex items-center gap-1">
              <Link to="/market">
                <RippleButton className="bg-transparent text-on-surface-variant hover:text-white hover:bg-white/10 font-headline font-bold text-xs tracking-widest h-8 px-3 rounded-lg">
                  MARKETPLACE
                  <RippleButtonRipples />
                </RippleButton>
              </Link>
              <Link to="/worth">
                <RippleButton className="bg-transparent text-on-surface-variant hover:text-white hover:bg-white/10 font-headline font-bold text-xs tracking-widest h-8 px-3 rounded-lg">
                  AI VALUATION
                  <RippleButtonRipples />
                </RippleButton>
              </Link>
              <Link to="/dashboard">
                <RippleButton className="bg-transparent text-on-surface-variant hover:text-white hover:bg-white/10 font-headline font-bold text-xs tracking-widest h-8 px-3 rounded-lg">
                  DASHBOARD
                  <RippleButtonRipples />
                </RippleButton>
              </Link>
              <Link to="/profile">
                <RippleButton className="bg-transparent text-on-surface-variant hover:text-white hover:bg-white/10 font-headline font-bold text-xs tracking-widest h-8 px-3 rounded-lg">
                  PROFILE
                  <RippleButtonRipples />
                </RippleButton>
              </Link>
            </nav>
          )}

          {/* Desktop Auth Buttons */}
          <div className="flex items-center gap-2">
            {token ? (
              <div onClick={handleLogout}>
                <RippleButton className="bg-white/10 text-white hover:bg-white/20 font-bold text-xs h-8 px-4 rounded-lg">
                  LOGOUT
                  <RippleButtonRipples />
                </RippleButton>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <RippleButton className="bg-transparent border border-white/10 text-on-surface-variant hover:text-white font-bold text-xs h-8 px-4 rounded-lg">
                    LOGIN
                    <RippleButtonRipples />
                  </RippleButton>
                </Link>
                <Link to="/signup">
                  <RippleButton className="bg-white/10 text-white hover:bg-white/20 font-bold text-xs h-8 px-4 rounded-lg">
                    SIGN UP
                    <RippleButtonRipples />
                  </RippleButton>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="lg:hidden">
        <StaggeredMenu
          isFixed
          position="right"
          items={mobileMenuItems}
          socialItems={[]}
          displaySocials={false}
          displayItemNumbering
          menuButtonColor="#dee5ff"
          openMenuButtonColor="#ffffff"
          changeMenuColorOnOpen
          colors={['#000000', '#0b0b0f']}
          accentColor="#5227FF"
          logoContent={
            <Link to="/" className="flex items-center gap-2 group pointer-events-auto">
              <div className="w-7 h-7 primary-gradient-bg rounded-md flex items-center justify-center transform group-hover:rotate-12 transition-all">
                <span className="material-symbols-outlined text-black font-bold text-sm">bolt</span>
              </div>
              <span className="font-headline text-base font-black tracking-tighter text-on-surface">
                KINETIC<span className="text-primary italic">VAULT</span>
              </span>
            </Link>
          }
        />
      </div>
    </>
  );
}

function Footer() {
  return (
    <footer className="border-t border-outline-variant/10 bg-surface-container-lowest/60 py-6 relative z-10">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 md:flex-row">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 primary-gradient-bg rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-black font-bold text-xs">bolt</span>
          </div>
          <span className="font-headline tracking-tighter font-black text-sm">KINETIC<span className="italic text-primary">VAULT</span></span>
        </Link>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-xs text-on-surface-variant md:justify-end md:text-left">
          {localStorage.getItem('token') && (
            <>
              <Link to="/market" className="hover:text-on-surface transition-colors">Marketplace</Link>
              <Link to="/worth" className="hover:text-on-surface transition-colors">AI Valuation</Link>
              <Link to="/dashboard" className="hover:text-on-surface transition-colors">Dashboard</Link>
              <Link to="/profile" className="hover:text-on-surface transition-colors">Profile</Link>
            </>
          )}
          <a href="#" className="hover:text-on-surface transition-colors">Terms</a>
          <a href="#" className="hover:text-on-surface transition-colors">Privacy</a>
        </div>

        {/* Copyright */}
        <p className="text-xs text-on-surface-variant">© 2026 Kinetic Vault</p>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col antialiased font-body font-medium selection:bg-primary/30 selection:text-primary">
      {/* Global backgrounds */}
      <HexagonBackground className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-30" />
      <div className="pointer-events-none fixed inset-0 z-[1] h-full w-full">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1}
          lightSpread={0.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
          pulsating={false}
          fadeDistance={1}
          saturation={1}
        />
      </div>
      <NavBar />
      <main className="relative z-10 flex-grow pt-20 sm:pt-24">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
