import { createContext, ReactNode, useMemo, useState } from 'react';
import { Recipe, RecipeDifficulty } from './types';
import useInitialSetup from '../utils/useInitialSetup';
import serverUrl from './config/serverUrl';
import { PostRecipesBody } from '../../server/routes/postRecipes';
import { ApiIngredient, ApiRecipe } from '../../server/routes/getRecipes';

export default function AllRecipesContextProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [recipes, setRecipes] = useState<Record<string, Recipe>>({});

    useInitialSetup(() => {
        const genericFailMessage =
            'Failed to get recipes data (see console for details).';
        fetch(`${serverUrl}/recipes`).then(
            async (response) => {
                if (!response.ok) {
                    alert(genericFailMessage);
                    console.error('Failed to get recipes data', response);
                    return;
                }

                const decoded: ApiRecipe[] =
                    (await response.json()) as ApiRecipe[];

                if (!Array.isArray(decoded)) {
                    alert(genericFailMessage);
                    console.error(
                        'Failed to get recipes data - server returned invalid data structure',
                        response,
                    );
                    return;
                }

                const recipesObject: Record<string, Recipe> = {};

                decoded.forEach((recipe: ApiRecipe) => {
                    const ingredients = recipe.ingredients;
                    // Quick fix for the demo
                    const dedupedIngredients: ApiIngredient[] = [];
                    ingredients.forEach((ingredient) => {
                        if (
                            !dedupedIngredients.find(
                                (dedupedIngredient) =>
                                    dedupedIngredient.name === ingredient.name,
                            )
                        ) {
                            dedupedIngredients.push(ingredient);
                        }
                    });

                    const instructions = recipe.instructions;
                    // Quick fix for the demo
                    const dedupedInstructions: string[] = [];
                    instructions.forEach((instruction) => {
                        if (!dedupedInstructions.includes(instruction)) {
                            dedupedInstructions.push(instruction);
                        }
                    });

                    recipesObject[recipe.uuid] = {
                        uuid: recipe.uuid,
                        name: recipe.name,
                        description: recipe.description,
                        difficulty: recipe.difficulty as RecipeDifficulty,
                        prepTimeMin: recipe.prep_time,
                        cookTimeMin: recipe.cook_time,
                        ingredients: dedupedIngredients,
                        instructions: dedupedInstructions,
                        note: recipe.notes,
                    };
                });

                setRecipes(recipesObject);
            },
            (reason) => {
                alert(genericFailMessage);
                console.error('Failed to get recipes data', reason);
            },
        );
    });

    const contextValue = useMemo(() => {
        const createRecipe: CreateRecipeFunction = async (
            requestBody,
            options,
        ) => {
            const result = await fetch(`${serverUrl}/recipes`, {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: [['Content-Type', 'application/json']],
            });

            if (result.ok) {
                const json: unknown = await result.json();
                if (
                    typeof json !== 'object' ||
                    json === null ||
                    !('uuid' in json) ||
                    typeof json.uuid !== 'string'
                ) {
                    throw new Error("Response didn't include uuid");
                }

                const uuid = json.uuid;

                setRecipes((prevState) => ({
                    ...prevState,
                    [uuid]: {
                        uuid,
                        name: requestBody.name,
                        description: requestBody.description,
                        difficulty: requestBody.difficulty,
                        prepTimeMin: requestBody.prep_time,
                        cookTimeMin: requestBody.cook_time,
                        ingredients: requestBody.ingredients,
                        instructions: requestBody.instructions,
                        note: requestBody.notes,
                    },
                }));

                options?.onSuccess?.();
            } else {
                options?.onError?.();
            }
        };

        return {
            recipes,
            createRecipe,
        };
    }, [recipes]);

    return (
        <AllRecipesContext.Provider value={contextValue}>
            {children}
        </AllRecipesContext.Provider>
    );
}

type CreateRecipeFunction = (
    recipe: PostRecipesBody,
    options?: { onSuccess?: () => void; onError?: () => void },
) => void;

interface AllRecipesContextValue {
    recipes: Record<string, Recipe>;
    createRecipe: CreateRecipeFunction;
}

export const AllRecipesContext = createContext<AllRecipesContextValue>({
    recipes: {},
    createRecipe: () => {},
});
