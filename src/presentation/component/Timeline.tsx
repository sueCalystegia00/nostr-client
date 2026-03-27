import type { Event } from "nostr-tools/pure";

interface Props {
	timeline: Event[];
}

export const Timeline = ({ timeline }: Props) => {
	return (
		<div>
			<h1>Timeline</h1>
			<ul>
				{timeline.map((event) => (
					<li key={event.id}>
						<p>{event.content}</p>
					</li>
				))}
			</ul>
		</div>
	);
};
