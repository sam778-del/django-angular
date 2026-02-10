export interface Document {
    id: string;
    file: string;
    file_name: string;
    file_size: number;
    file_type: string;
    record: string;
    uploader: string;
    datetime_created: string;
}

export interface CreateDocumentDto {
    file: File;
    record: string;
}