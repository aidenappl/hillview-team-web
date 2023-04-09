import Head from "next/head";
import Script from "next/script";

const PageHead = ({ title = "HillviewTV - Team Dashboard" }: any) => {
	return (
		<>
			<Head>
				<title>{title}</title>
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/favicons/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/favicons/favicon-32x32.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/favicons/favicon-16x16.png"
				/>
				<link rel="manifest" href="/favicons/site.webmanifest" />
				<meta
					name="viewport"
					content="width=device-width,height=device-height initial-scale=1"
				/>
				<link
					rel="mask-icon"
					href="/favicons/safari-pinned-tab.svg"
					color="#444860"
				/>
				<link rel="shortcut icon" href="/favicons/favicon.ico" />
				<meta name="msapplication-TileColor" content="#444860" />
				<meta
					name="msapplication-config"
					content="/favicons/browserconfig.xml"
				/>
				<meta name="theme-color" content="#444860" />

				<link rel="canonical" href="https://team.trailblaze.to/"></link>

				<meta name="title" content="Trailblaze - Team Dashboard"></meta>
				<meta
					name="description"
					content="Join the professional ecosystem of tomorrow, find jobs & opportunities, connect & chat with likeminded individuals and kickstart your careers with Trailblaze."
				></meta>

				<meta property="og:type" content="website"></meta>
				<meta property="og:url" content="https://trailblaze.to/"></meta>
				<meta property="og:title" content="Trailblaze - Team Dashboard"></meta>
				<meta
					property="og:description"
					content="Join the professional ecosystem of tomorrow, find jobs & opportunities, connect & chat with likeminded individuals and kickstart your careers with Trailblaze."
				></meta>
				<meta
					property="og:image"
					content="https://trailblaze.to/trailblaze-blue-bg.jpg"
				></meta>

				<meta property="twitter:card" content="summary_large_image"></meta>
				<meta property="twitter:url" content="https://trailblaze.to/"></meta>
				<meta
					property="twitter:title"
					content="Trailblaze - Team Dashboard"
				></meta>
				<meta
					property="twitter:description"
					content="Join the professional ecosystem of tomorrow, find jobs & opportunities, connect & chat with likeminded individuals and kickstart your careers with Trailblaze."
				></meta>
				<meta
					property="twitter:image"
					content="https://trailblaze.to/trailblaze-blue-bg.jpg"
				></meta>

				<meta property="twitter:card" content="summary"></meta>
				<meta property="twitter:url" content="https://trailblaze.to/"></meta>
				<meta
					property="twitter:title"
					content="Trailblaze - Team Dashboard"
				></meta>
				<meta
					property="twitter:description"
					content="Join the professional ecosystem of tomorrow, find jobs & opportunities, connect & chat with likeminded individuals and kickstart your careers with Trailblaze."
				></meta>
				<meta
					property="twitter:image"
					content="https://trailblaze.to/trailblaze-blue-bg.jpg"
				></meta>
			</Head>
		</>
	);
};

export default PageHead;
