// Load the spring engine only on pages that actually use these sections.
import { setupStatementIcons } from './statement-icons';
import { setupModelTimeline } from './model-timeline';
import { setupTopicMarquee } from './topic-marquee';
document.querySelectorAll('[data-home-statement]').forEach(setupStatementIcons);
document.querySelectorAll('.model-timeline').forEach(path=>setupModelTimeline(path.closest('section')));
setupTopicMarquee(document.querySelector('[data-topic-marquee]'));
