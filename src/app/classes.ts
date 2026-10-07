export class Pattern {
    id: number;
    name: string;
    brand?: string | null;
    difficulty: number;
    free: boolean;
    used: boolean;
    fabric: Fabric[];
    materials: Material[];
    category: Category;
    photos: string[];
    techDrawings: string[];
    files: string[];
    comments: Comment[];
    description?: string;
    //notes: Note[] = [];

    constructor() {
        this.id = 0;
        this.name = "";
        this.brand = null;
        this.difficulty = 1;
        this.free = true;
        this.used = false;
        this.fabric = [];
        this.materials = [];
        this.category = Category.else;
        this.photos = [];
        this.techDrawings = [];
        this.files = [];
        this.comments = [];
    }
    
    set(name: string, category: Category, photos: string[], techDrawings: string[], files: string[], brand?: string | null, difficulty: number = 1, free: boolean = true, used: boolean = false, fabric: Fabric[] = [], materials: Material[] = []) {
        this.name = name;
        this.brand = brand ?? null;
        this.difficulty = difficulty;
        this.free = free;
        this.used = used;
        this.fabric = fabric;
        this.materials = materials;
        this.category = category;
        this.photos = photos;
        this.techDrawings = techDrawings;
        this.files = files;
    }
}

export interface Pattern {
    id: number;
    name: string;
    brand?: string | null;
    difficulty: number;
    free: boolean;
    used: boolean;
    fabric: Fabric[];
    materials: Material[];
    category: Category;
    photos: string[];
    techDrawings: string[];
    files: string[];
    comments: Comment[];
    description?: string;
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

export interface PatternEdit {
    delPhotos: string[];
    delTechDrawings: string[];
    delFiles: string[];
    newPhotos: string[];
    newTechDrawings: string[];
    newFiles: string[];
}

export class NewPattern {
    name: string;
    brand?: string | null;
    difficulty: number;
    free: boolean;
    used: boolean;
    fabric: Fabric[];
    materials: Material[];
    category: Category;
    photos: string[];
    techDrawings: string[];
    files: string[];

    constructor() {
        this.name = "pattern";
        this.brand = null;
        this.difficulty = 1;
        this.free = true;
        this.used = false;
        this.fabric = [];
        this.materials = [];
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

export interface Comment {
    id: number;
    date: Date;
    text: string;
}

export interface Fabric {
    type: string;
    requirement: string;
}

export interface Material {
    type: string;
    requirement: string;
}

