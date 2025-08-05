export default function Dashboard() {}

export const getServerSideProps = () => {
	return {
		redirect: {
			destination: "/team/dashboard/videos",
			permanent: true,
		},
	};
};
