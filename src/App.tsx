import { PostForm } from "./presentation/component/PostForm";
import { Timeline } from "./presentation/component/Timeline";
import { useTimeline } from "./presentation/hooks/useTimeline";

function App() {
	const { timeline } = useTimeline();
	return (
		<div>
			<PostForm />
			<Timeline timeline={timeline} />
		</div>
	);
}

export default App;
