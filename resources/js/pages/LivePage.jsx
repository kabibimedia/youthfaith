import { useParams, useNavigate } from 'react-router-dom';
import LiveViewer from '../components/live/LiveViewer';

export default function LivePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    return <LiveViewer sessionId={id} onClose={() => navigate(-1)} />;
}
