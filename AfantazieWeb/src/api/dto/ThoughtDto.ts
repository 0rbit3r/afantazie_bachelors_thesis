export interface thoughtDto{
    id: number,
    author: string,
    title: string,
    content: string,
    color: string,
    dateCreated: string,
    links: number[],
    backlinks:number[]
}

export interface createThoughtDto {
    title: string,
    content: string,
    links: number[]
}

export interface thoughtTitleDto {
    id: number,
    title: string,
    color: string,
}   