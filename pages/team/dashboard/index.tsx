export default function Dashboard() {}

export const getStaticProps = () => {
	return {
		redirect: {
            destination: '/team/dashboard/assets',
            permanent: true,
        }
	};
};
