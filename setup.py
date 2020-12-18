from distutils.core import setup
from setuptools import find_packages

setup(
    name='labAPI',
    version='0.1',
    description='Software frameworks for the modern lab',
    author='Robert Fasano',
    author_email='robert.fasano@nist.gov',
    packages=find_packages(exclude=['docs']),
    license='MIT',
    long_description=open('README.md').read(),
    install_requires=[],
    entry_points='''
    [console_scripts]
    labAPI=labAPI.cmd:main
    ''',
)
