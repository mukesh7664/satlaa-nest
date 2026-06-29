import Script from "next/script";

interface AnalyticsScriptsProps {
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  facebookPixelId?: string;
}

export function AnalyticsScripts({
  googleAnalyticsId,
  googleTagManagerId,
  facebookPixelId,
}: AnalyticsScriptsProps) {
  // Logic to handle cases where GA4 ID (starting with G-) is put in GTM field
  let effectiveGAId = googleAnalyticsId;
  let effectiveGTMId = googleTagManagerId;

  if (googleTagManagerId?.startsWith("G-") && !googleAnalyticsId) {
    effectiveGAId = googleTagManagerId;
    effectiveGTMId = undefined;
  }

  return (
    <>
      {/* Google Analytics */}
      {effectiveGAId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${effectiveGAId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${effectiveGAId}');
            `}
          </Script>
        </>
      )}

      {/* Google Tag Manager */}
      {effectiveGTMId && effectiveGTMId.startsWith("GTM-") && (
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${effectiveGTMId}');
          `}
        </Script>
      )}

      {/* Facebook Pixel */}
      {facebookPixelId && (
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${facebookPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}

interface CustomScriptsProps {
  headerScripts?: string;
  footerScripts?: string;
}

export function CustomScripts({
  headerScripts,
  footerScripts,
}: CustomScriptsProps) {
  return (
    <>
      {/* Header Scripts */}
      {headerScripts && (
        <div dangerouslySetInnerHTML={{ __html: headerScripts }} />
      )}

      {/* Footer Scripts */}
      {footerScripts && (
        <Script id="custom-footer-scripts" strategy="lazyOnload">
          {footerScripts}
        </Script>
      )}
    </>
  );
}
