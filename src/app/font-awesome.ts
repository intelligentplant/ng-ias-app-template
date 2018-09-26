import { library } from '@fortawesome/fontawesome-svg-core';
import {
    faChartLine,
    faCheck,
    faChevronLeft,
    faChevronRight,
    faCircleNotch,
    faCogs,
    faEdit,
    faFile,
    faGlobe,
    faHome,
    faInfoCircle,
    faPlus,
    faSearch,
    faSignInAlt,
    faSignOutAlt,
    faTachometerAlt,
    faTag,
    faTags,
    faTimes,
    faTrash
} from '@fortawesome/free-solid-svg-icons';

export function loadFaIcons(): void {
    library.add(
        faChartLine,
        faCheck,
        faChevronLeft,
        faChevronRight,
        faCircleNotch,
        faCogs,
        faEdit,
        faFile,
        faGlobe,
        faHome,
        faInfoCircle,
        faPlus,
        faSearch,
        faSignInAlt,
        faSignOutAlt,
        faTachometerAlt,
        faTag,
        faTags,
        faTimes,
        faTrash
    );
}
