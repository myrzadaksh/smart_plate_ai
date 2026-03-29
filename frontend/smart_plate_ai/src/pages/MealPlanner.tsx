import React, { useState, useEffect } from 'react';
import { Plus, X, ChefHat } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format, startOfWeek, addDays } from 'date-fns';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface Recipe {
    id: number | string;
    name: string;
    cuisine_type?: string;
    [key: string]: any;
}

export interface MealPlan {
    id: number | string;
    recipe_name: string;
    meal_date: string;
    meal_type: string;
    [key: string]: any;
}

interface SelectedSlot {
    date: string;
    mealType: string;
}

const MealPlanner = () => {
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
    const [mealPlan, setMealPlan] = useState<Record<string, Record<string, MealPlan>>>({});
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);

    useEffect(() => {
        fetchMealPlan();
        fetchRecipes();
    }, [weekStart]);

    const fetchMealPlan = async () => {
        try {
            setLoading(true);
            const startDate = format(weekStart, 'yyyy-MM-dd');
            const endDate = format(addDays(weekStart, 6), 'yyyy-MM-dd');

            const response = await api.get(`/meal-plans/weekly?start_date=${startDate}&end_date=${endDate}`);
            const meals: MealPlan[] = response.data?.data?.mealPlans || [];

            const organized: Record<string, Record<string, MealPlan>> = {};
            meals.forEach(meal => {
                const dateKey = meal.meal_date;
                if (!organized[dateKey]) {
                    organized[dateKey] = {};
                }
                organized[dateKey][meal.meal_type] = meal;
            });

            setMealPlan(organized);
        } catch (error) {
            toast.error('Failed to load meal plan');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecipes = async () => {
        try {
            const response = await api.get('/recipes');
            setRecipes(response.data?.data?.recipes || []);
        } catch (error) {
            console.error('Failed to load recipes');
        }
    };

    const handleAddMeal = (date: string, mealType: string) => {
        setSelectedSlot({ date, mealType });
        setShowAddModal(true);
    };

    const handleRemoveMeal = async (mealId: number | string) => {
        if (!window.confirm('Remove this meal from your plan?')) return;

        try {
            await api.delete(`/meal-plans/${mealId}`);
            await fetchMealPlan();
            toast.success('Meal removed');
        } catch (error) {
            toast.error('Failed to remove meal');
        }
    };

    const getDayMeals = (dayIndex: number) => {
        const date = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
        return mealPlan[date] || {};
    };

    if (loading && Object.keys(mealPlan).length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Meal Planner</h1>
                        <p className="text-gray-600 mt-1">Plan your weekly meals</p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={() => setWeekStart(addDays(weekStart, -7))}
                            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm sm:text-base"
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => setWeekStart(startOfWeek(new Date()))}
                            className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap"
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => setWeekStart(addDays(weekStart, 7))}
                            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm sm:text-base"
                        >
                            Next
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Week of</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                    <div className="min-w-[800px]">
                        <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
                            <div className="p-4 font-semibold text-gray-700 border-r border-gray-200 sticky left-0 bg-gray-50 z-10">
                                Meal
                            </div>
                            {DAYS_OF_WEEK.map((day, index) => (
                                <div key={day} className="p-4 text-center border-r border-gray-200 last:border-r-0">
                                    <div className="font-semibold text-gray-900">{day.slice(0, 3)}</div>
                                    <div className="text-sm text-gray-500">
                                        {format(addDays(weekStart, index), 'MMM d')}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {MEAL_TYPES.map(mealType => (
                            <div key={mealType} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0">
                                <div className="p-4 font-medium text-gray-700 capitalize border-r border-gray-200 bg-gray-50 sticky left-0 z-10">
                                    {mealType}
                                </div>
                                {DAYS_OF_WEEK.map((_, dayIndex) => {
                                    const date = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
                                    const dayMeals = getDayMeals(dayIndex);
                                    const meal = dayMeals[mealType];

                                    return (
                                        <div
                                            key={dayIndex}
                                            className="p-2 sm:p-3 border-r border-gray-200 last:border-r-0 min-h-[100px] hover:bg-gray-50 transition-colors"
                                        >
                                            {meal ? (
                                                <div className="relative group h-full">
                                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 h-full flex flex-col justify-between">
                                                        <p className="text-xs sm:text-sm font-medium text-emerald-900 line-clamp-3">
                                                            {meal.recipe_name}
                                                        </p>
                                                        <button
                                                            onClick={() => handleRemoveMeal(meal.id)}
                                                            className="absolute top-1 right-1 p-1 bg-white rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                            title="Remove meal"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleAddMeal(date, mealType)}
                                                    className="w-full h-full min-h-[80px] flex items-center justify-center text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors group"
                                                >
                                                    <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <p className="text-sm text-gray-600">Meals Planned</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {Object.values(mealPlan).reduce((acc, day) => acc + Object.keys(day).length, 0)}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <p className="text-sm text-gray-600">Available Recipes</p>
                        <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <p className="text-sm text-gray-600">This Week</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">
                            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
                        </p>
                    </div>
                </div>
            </div>

            {showAddModal && selectedSlot && (
                <AddMealModal
                    date={selectedSlot.date}
                    mealType={selectedSlot.mealType}
                    recipes={recipes}
                    onClose={() => {
                        setShowAddModal(false);
                        setSelectedSlot(null);
                    }}
                    onSuccess={() => {
                        fetchMealPlan();
                        setShowAddModal(false);
                        setSelectedSlot(null);
                    }}
                />
            )}
        </div>
    );
};

interface AddMealModalProps {
    date: string;
    mealType: string;
    recipes: Recipe[];
    onClose: () => void;
    onSuccess: () => void;
}

const AddMealModal = ({ date, mealType, recipes, onClose, onSuccess }: AddMealModalProps) => {
    const [selectedRecipe, setSelectedRecipe] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const filteredRecipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRecipe) {
            toast.error('Please select a recipe');
            return;
        }

        setLoading(true);

        try {
            await api.post('/meal-plans', {
                recipe_id: selectedRecipe,
                planned_date: date, 
                meal_type: mealType
            });
            toast.success('Meal added to plan');
            onSuccess();
        } catch (error) {
            toast.error('Failed to add meal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Add Meal</h2>
                        <p className="text-sm text-gray-600 capitalize">
                            {format(new Date(date), 'EEEE, MMM d')} - {mealType}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search recipes..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        />
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                        {filteredRecipes.length > 0 ? (
                            filteredRecipes.map(recipe => (
                                <label
                                    key={recipe.id}
                                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedRecipe === recipe.id.toString()
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="recipe"
                                        value={recipe.id.toString()}
                                        checked={selectedRecipe === recipe.id.toString()}
                                        onChange={(e) => setSelectedRecipe(e.target.value)}
                                        className="w-4 h-4 text-emerald-500 border-gray-300 focus:ring-emerald-500"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{recipe.name}</p>
                                        {recipe.cuisine_type && (
                                            <p className="text-xs text-gray-500">{recipe.cuisine_type}</p>
                                        )}
                                    </div>
                                </label>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500">No recipes found</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !selectedRecipe}
                            className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Meal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MealPlanner;