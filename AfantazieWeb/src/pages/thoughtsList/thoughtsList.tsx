import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchThoughtTitles } from "../../api/graphClient";
import { thoughtTitleDto } from "../../api/dto/ThoughtDto";

export default function ThoughtsList() {
    const [thoughtTitles, setThoughtTitles] = useState<thoughtTitleDto[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getLogs = async () => {
            const response = await fetchThoughtTitles();
            if (response.ok) {
                setThoughtTitles(response.data!.reverse());
            }
        };
        getLogs();
    }, []);

    return (
        <div className="content-container">
            <div className="list-container">
            {thoughtTitles.map((thought, index) => (
                <div key={index} className="thought" style={{ borderColor: thought.color }} onClick={_ => navigate('/graph/' + thought.id)}>
                    <div className="thought-title">{thought.title}</div>
                </div>
            ))}
        </div>
        </div>
    );
}