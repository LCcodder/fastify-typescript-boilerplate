import { NoteModel } from "../../database/ModelsFactory";
import { INotesService } from "./INotesService";

export class NotesService {
    constructor(private Note: NoteModel) {}
}