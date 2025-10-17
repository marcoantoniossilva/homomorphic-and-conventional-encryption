import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class ApplicationUtils {
    constructor() { }

    getMessageError(error: any) {
        if (error.status === 0) {
            return 'Não foi possível conectar ao servidor';
        } else if (error.status === 400) {
            return 'Dados inválidos: ' + (error.error?.errors?.join(', ') || error.error?.message || '');
        } else if (error.status === 401) {
            return error.error?.message || `Usuário não autenticado`;
        } else if (error.status === 404) {
            return error.error?.message || `Registro não encontrado`;
        } else if (error.status === 409) {
            return error.error?.message || `Já existe um registro com este identificador`;
        }

        return error.error?.message || 'Erro desconhecido';
    }

    toTitleCase(str: string): string {
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word[0]?.toUpperCase() + word.substring(1))
            .join(' ');
    }

    getActionMessageByFormActionInMale(formAction: string, inPastTense: boolean): string {
        switch (formAction) {
            case 'create':
                return inPastTense ? 'criado' : 'criar';
            case 'update':
                return inPastTense ? 'alterado' : 'alterar';
            default:
                return 'criar';
        }
    }

    getActionMessageByFormActionInFemale(formAction: string, inPastTense: boolean): string {
        switch (formAction) {
            case 'create':
                return inPastTense ? 'criada' : 'criar';
            case 'update':
                return inPastTense ? 'alterada' : 'alterar';
            default:
                return 'criar';
        }
    }
}