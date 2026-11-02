export interface PatternPartial {
    id: number;
    name: string;
    brand?: string | null;
    difficulty: number;
    free: boolean;
    used: boolean;
    category: Category;
    photos: string[];
    techDrawings: string[];
}

export interface Pattern extends PatternPartial {
    description?: string;
    fabric: Fabric[];
    materials: Material[];
    files: string[];
    sharedFiles: SharedFile[];
    comments: Comment[];
}

export interface NewPattern extends PatternPartial {
    description?: string;
    fabric: Fabric[];
    materials: Material[];
    files: string[];
    comments: Comment[];
    
    sharedFiles: SharedFile[];
    newSharedFiles: string[];
}

export function createPattern(overrides: Partial<NewPattern> = {}): NewPattern {
    return {
        id: 0,
        name: "",
        brand: null,
        difficulty: 1,
        free: true,
        used: false,
        description: "",
        fabric: [],
        materials: [],
        category: Category.else,
        photos: [],
        techDrawings: [],
        files: [],
        sharedFiles: [],
        newSharedFiles: [],
        comments: [],
        ...overrides,
    };
}

// usage
//const p = createPattern({ name: "Summer dress", difficulty: 3 });

export interface PatternEdit {
    delPhotos: string[];
    delTechDrawings: string[];
    delFiles: string[];
    newPhotos: string[];
    newTechDrawings: string[];
    newFiles: string[];
    newSharedFiles: string[];
}

export function createPatternEdit(overrides: Partial<PatternEdit> = {}): PatternEdit {
    return {
        delPhotos: [],
        delTechDrawings: [],
        delFiles: [],
        newPhotos: [],
        newTechDrawings: [],
        newFiles: [],
        newSharedFiles: [],
        ...overrides,
    };
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

export interface SharedFile {
    id: number;
    filePath: string;
}

