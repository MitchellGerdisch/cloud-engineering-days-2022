from setuptools import setup, find_packages
# List of requirements
requirements = []  # This could be retrieved from requirements.txt
# Package (minimal) configuration
setup(
    name="components",
    version="0.0.3",
    description="component resources",
    py_modules=["aks", "cosmos", "ingress_ctl"],
    # packages=find_packages(),  # __init__.py folders search
    install_requires=requirements
)