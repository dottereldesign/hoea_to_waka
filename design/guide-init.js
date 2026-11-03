import { setupBrandInfo } from './brand-info';
import { setupEmailPreviews } from './email-preview';
import { setupCardStudy } from './card-study';
import { setupSocialPreviews } from './social-previews';
import { setupBrandEditor } from './brand-colours';
import { setupStatementCopy } from './statement-copy';
import { setupTypographyStudies } from './typography-studies';
import { setupBrandDownloads } from './brand-assets';
document.addEventListener('DOMContentLoaded',()=>{setupBrandEditor();setupStatementCopy();setupBrandInfo();setupTypographyStudies();setupBrandDownloads();setupEmailPreviews();setupSocialPreviews();setupCardStudy();},{once:true});
