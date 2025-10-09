import { Response } from 'express';
import { ApiResponse, ValidationError } from '../types/api-response';

// Helper pour les réponses succès
export const sendSuccess = <T>(
    res: Response,
    data: T,
    message: string,
    statusCode: number = 200
): Response => {
    const response: ApiResponse<T> = {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    };
    
    return res.status(statusCode).json(response);
};

// Helper pour les erreurs générales
export const sendError = (
    res: Response,
    message: string,
    errors?: ValidationError[],
    statusCode: number = 400
): Response => {
    const response: ApiResponse<null> = {
        success: false,
        message,
        errors,
        timestamp: new Date().toISOString()
    };
    
    return res.status(statusCode).json(response);
};

// Helper spécialisé pour les erreurs de validation Zod
export const sendValidationError = (
    res: Response,
    zodError: any
): Response => {
    const errors: ValidationError[] = zodError.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
        code: `INVALID_${err.path.join('_').toUpperCase()}`
    }));
    
    return sendError(res, 'Données invalides', errors, 400);
};
