import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// For newer zod versions, AnyZodObject might not be exported directly from root, or maybe it's just 'AnyZodObject'
import { z } from 'zod';

export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.issues,
        });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};
