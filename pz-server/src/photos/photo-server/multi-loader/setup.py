from setuptools import setup
from setuptools import find_packages

REQUIREMENTS = [
    "thumbor>=5.0.0"
]

setup(
    name="praisee_multi_loader",
    version="1.0.0",
    author="Praisee",
    author_email="praisee@praisee.com",
    description="Load images from multiple sources",
    include_package_data=True,
    packages=find_packages(),
    install_requires=REQUIREMENTS,
    zip_safe=False
)
