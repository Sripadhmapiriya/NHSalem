import os
import shutil

paths = [
    r'd:\artiowings\NHSalem\frontend\src\pages\admin\RecipesCMS',
    r'd:\artiowings\NHSalem\frontend\src\pages\Recipes',
    r'd:\artiowings\NHSalem\frontend\src\pages\RecipeArticle',
    r'd:\artiowings\NHSalem\frontend\src\store\recipeStore.js',
    r'd:\artiowings\NHSalem\frontend\src\mock\recipes.js'
]

for p in paths:
    if os.path.exists(p):
        if os.path.isdir(p):
            shutil.rmtree(p)
        else:
            os.remove(p)
