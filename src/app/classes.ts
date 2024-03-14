export class Pattern {
    name: string;
    photos: string[] = [];
    techDrawings: string[] = [];
    files: string[];
    //a0: File | null = null;
    notes: Note[] = [];
    category?: Category;
    constructor(name: string, files: File[]) {
        this.name = name;
        this.files = files.map(file  => file.path);
    }
}

export class Note {
    title: string = '';
    content: string = '';
    date?: Date;
}

export enum Category {
    "top",
    "bottom",
    "dress",
    "accessory",
    "else"
}