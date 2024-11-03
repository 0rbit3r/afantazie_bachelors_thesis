import { API_URL, sendAndExpectBody } from "./ApiClient";
import { apiResponseWithBody as ApiResponseWithBody } from "./dto/ApiResponse";
import { createThoughtDto, thoughtDto, thoughtTitleDto } from "./dto/ThoughtDto";

export async function fetchThoughts(): Promise<ApiResponseWithBody<thoughtDto[]>> {
    const response = await sendAndExpectBody<thoughtDto[]>(`${API_URL}/thoughts/graph`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        // credentials: 'include'
    });

    return response;
}

export async function fetchThoughtTitles(): Promise<ApiResponseWithBody<thoughtTitleDto[]>> {
    const response = await sendAndExpectBody<thoughtDto[]>(`${API_URL}/thoughts/titles`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        // credentials: 'include'
    });

    return response;
}

export async function fetchThought(id: number): Promise<ApiResponseWithBody<thoughtDto>> {
    const response = await sendAndExpectBody<thoughtDto>(`${API_URL}/thoughts/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        // credentials: 'include'
    });

    return response;
}


export async function postNewThought(thought: createThoughtDto): Promise<ApiResponseWithBody<number>> {
    const response = await sendAndExpectBody<number>(`${API_URL}/thoughts/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(thought)
    });

    return response;
}

