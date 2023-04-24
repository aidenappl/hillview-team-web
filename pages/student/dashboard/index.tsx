export default function Dashboard() {}

export const getServerSideProps = () => {
	return {
		redirect: {
            destination: '/student/dashboard/videos',
            permanent: true,
        }
	};
};
