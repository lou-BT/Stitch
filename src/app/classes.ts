export class Pattern {
    name: string;
    category: Category;
    photos: string[];
    techDrawings: string[];
    files: string[];
    //notes: Note[] = [];

    constructor() {
        this.name = "";
        this.category = Category.else;
        this.photos = [];
        this.techDrawings = [];
        this.files = [];
    }
    
    set(name: string, category: Category, photos: string[], techDrawings: string[], files: string[]) {
        this.name = name;
        this.category = category;
        this.photos = photos;
        this.techDrawings = techDrawings;
        this.files = files;
    }
}

export class PatternEdit {
    delPhotos: string[];
    delTechDrawings: string[];
    delFiles: string[];
    newPhotos: string[];
    newTechDrawings: string[];
    newFiles: string[];

    constructor( pattern: Pattern ) {
        this.delPhotos = [];
        this.delTechDrawings = [];
        this.delFiles = [];
        this.newPhotos = [];
        this.newTechDrawings = [];
        this.newFiles = [];
    }
}

export class NewPattern {
    name: string;
    category: Category;
    photos: string[];
    techDrawings: string[];
    files: string[];

    constructor() {
        this.name = "pattern";
        this.category = Category.top;
        this.photos = [];
        this.techDrawings = [];
        this.files = [];
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
    "one piece",
    "accessory",
    "else"
}

export const Categories = ["top",
    "bottom",
    "dress",
    "one piece",
    "accessory",
    "else"]

// class FileLink {
//     name: string;
//     path: string;
// }