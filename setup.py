from distutils.core import setup

setup(
    name='FactMap',
    version='0.1.0',
    author='Scott Smith',
    author_email='scottsmith1@gmail.com',
    packages=['factmap','factmap.test'],
    #scripts=['bin/hi'],
    #url='http://pypi.python.org/pypi/FactMap/',
    license='LICENSE.txt',
    description='Selection of assertions on the web.',
    long_description=open('README.txt').read(),
    install_requires=[
        "Django >= 1.1.1",
    ],
)
