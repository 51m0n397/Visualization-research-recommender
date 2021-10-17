# Visualization research recommender
This repository contains the code of my project for the 2020/2021 Visual Analytics course from the Engineering in Computer Science master's degree at Sapienza - University of Rome.

Visualization research recommender is a visual analytics tool that can be used to explore the literature in the visualization field to find the best topics to study by analyzing their trends. 

## Folder structure
- `original-data` contains the original vispubdata dataset from [vispubdata.org]()
- `preprocessing` contains a python notebook with the code used to preprocess the data
- `preprocessed-data` contains the result of the preprocessing
- `python-server` contains the code for the python-based server responsible for clustering the keywords into topics
- `javascript-client` contains the code for the html+javascript webpage that implements the tool
- `report` contains the relation describing the tool
- `presentation` contains the powerpoint presentation describing the tool

## How to run
- To start the python server go into the `python-server` folder and use the command `python3 server.py`. This will launch the server locally on port 5000
- To start serving the webpage of the tool go into the `javascript-client` and use the command `npm run start`. The webpage will be available at the address [http://localhost:8080/]()
