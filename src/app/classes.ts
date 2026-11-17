export interface PatternPartial {
    id: number;
    name: string;
    brand?: string | null;
    difficulty: number;
    free: boolean;
    used: boolean;
    categoryId: number | null;
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

export interface NewPattern extends Pattern {
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
        categoryId: null,
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

export interface Category {
    id: number;
    name: string;
}

// export enum Category {
//     "top",
//     "bottom",
//     "dress",
//     "one piece",
//     "accessory",
//     "else"
// }

// export const Categories = ["top",
//     "bottom",
//     "dress",
//     "one piece",
//     "accessory",
//     "else"]

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

