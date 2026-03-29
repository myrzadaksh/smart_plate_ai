import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Users, ArrowLeft, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Ingredient {
    name: string;
    quantity: number;
    unit: string;
}

interface Nutrition {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    fiber?: number;
}

export interface Recipe {
    id: number | string;
    name: string;
    description?: string;
    cuisine_type?: string;
    difficulty?: string;
    dietary_tags?: string[];
    prep_time?: number;
    cook_time?: number;
    servings?: number;
    ingredients?: Ingredient[];
    instructions?: string[] | { step: number; text: string }[]; 
    nutrition?: Nutrition;
    user_notes?: string;
    [key: string]: any;
}

const RecipeDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [servings, setServings] = useState<number>(4);
    const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (id) {
            fetchRecipe();
        }
    }, [id]);

    const fetchRecipe = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/recipes/${id}`);
            const recipeData = response.data?.data?.recipe;
            
            if (recipeData) {
                setRecipe(recipeData);
                setServings(recipeData.servings || 4);
            } else {
                 toast.error('Recipe not found');
                 navigate('/recipes');
            }
        } catch (error) {
            toast.error('Failed to load recipe');
            navigate('/recipes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this recipe?')) return;

        try {
            await api.delete(`/recipes/${id}`);
            toast.success('Recipe deleted');
            navigate('/recipes');
        } catch (error) {
            toast.error('Failed to delete recipe');
        }
    };

    const toggleIngredient = (index: number) => {
        const newChecked = new Set(checkedIngredients);
        if (newChecked.has(index)) {
            newChecked.delete(index);
        } else {
            newChecked.add(index);
        }
        setCheckedIngredients(newChecked);
    };

    const adjustQuantity = (originalQty: number, originalServings: number) => {
        return ((originalQty * servings) / originalServings).toFixed(2);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!recipe) {
        return null;
    }

    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
    const originalServings = recipe.servings || 4;

    const renderInstruction = (stepData: any, index: number) => {
        if (typeof stepData === 'string') {
             return <p className="text-gray-700 pt-1 flex-1">{stepData}</p>;
        }
        if (stepData && typeof stepData === 'object' && stepData.text) {
             return <p className="text-gray-700 pt-1 flex-1">{stepData.text}</p>;
        }
        return <p className="text-gray-700 pt-1 flex-1">Step {index + 1}</p>;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link
                    to="/recipes"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Recipes
                </Link>

                <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 pr-4">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.name}</h1>
                            {recipe.description && (
                                <p className="text-gray-600 text-lg">{recipe.description}</p>
                            )}
                        </div>
                        <button
                            onClick={handleDelete}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                            title="Delete Recipe"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {recipe.cuisine_type && (
                            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                {recipe.cuisine_type}
                            </span>
                        )}
                        {recipe.difficulty && (
                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${recipe.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                {recipe.difficulty}
                            </span>
                        )}
                        {recipe.dietary_tags && Array.isArray(recipe.dietary_tags) && recipe.dietary_tags.map(tag => (
                            <span key={tag} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-6 text-gray-600">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            <span className="font-medium">{totalTime} minutes</span>
                        </div>
                        {recipe.prep_time && (
                            <div className="text-sm">
                                Prep: {recipe.prep_time} min
                            </div>
                        )}
                        {recipe.cook_time && (
                            <div className="text-sm">
                                Cook: {recipe.cook_time} min
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Ingredients</h2>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">Servings:</span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setServings(Math.max(1, servings - 1))}
                                        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                    >
                                        −
                                    </button>
                                    <span className="text-lg font-semibold text-gray-900 w-12 text-center">
                                        {servings}
                                    </span>
                                    <button
                                        onClick={() => setServings(servings + 1)}
                                        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                    >
                                        +
                                    </button>
                                    {servings !== originalServings && (
                                        <button
                                            onClick={() => setServings(originalServings)}
                                            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {recipe.ingredients && recipe.ingredients.map((ingredient, index) => {
                                    const qty = ingredient.quantity || 0;
                                    const adjustedQty = adjustQuantity(qty, originalServings);
                                    const isChecked = checkedIngredients.has(index);

                                    return (
                                        <label
                                            key={index}
                                            className="flex items-start gap-3 cursor-pointer group"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleIngredient(index)}
                                                className="mt-1 w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                                            />
                                            <span className={`flex-1 ${isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                                {qty > 0 && <span className="font-medium">{adjustedQty} </span>}
                                                {ingredient.unit && <span>{ingredient.unit} </span>}
                                                {ingredient.name}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
                            <ol className="space-y-4">
                                {recipe.instructions && Array.isArray(recipe.instructions) && recipe.instructions.map((step, index) => (
                                    <li key={index} className="flex gap-4">
                                        <span className="shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                            {index + 1}
                                        </span>
                                        {renderInstruction(step, index)}
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {recipe.nutrition && Object.keys(recipe.nutrition).length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Nutrition (per serving)</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                    <NutritionCard label="Calories" value={recipe.nutrition.calories || 0} unit="kcal" />
                                    <NutritionCard label="Protein" value={recipe.nutrition.protein || 0} unit="g" />
                                    <NutritionCard label="Carbs" value={recipe.nutrition.carbs || 0} unit="g" />
                                    <NutritionCard label="Fats" value={recipe.nutrition.fats || 0} unit="g" />
                                    <NutritionCard label="Fiber" value={recipe.nutrition.fiber || 0} unit="g" />
                                </div>
                            </div>
                        )}

                        {recipe.user_notes && (
                            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6">
                                <h3 className="font-semibold text-emerald-900 mb-2">📝 Notes</h3>
                                <p className="text-emerald-800">{recipe.user_notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface NutritionCardProps {
    label: string;
    value: number | string;
    unit: string;
}

const NutritionCard = ({ label, value, unit }: NutritionCardProps) => (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
        <div className="text-2xl font-bold text-gray-900">{value}{unit}</div>
        <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
);

export default RecipeDetail;