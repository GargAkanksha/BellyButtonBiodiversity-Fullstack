# import necessary libraries
import pandas as pd

from flask import (
     Flask,
    render_template,
    jsonify,
    request,
    redirect)

from flask_sqlalchemy import SQLAlchemy

# Python SQL toolkit and Object Relational Mapper
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Database Setup
#################################################
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///db/bellybutton.sqlite"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Declare a Base using `automap_base()`
# http://docs.sqlalchemy.org/en/latest/orm/extensions/automap.html
Base = automap_base()

# Use the Base class to reflect the database tables
Base.prepare(db.engine, reflect=True)

# Save the reference to each table
samples = Base.classes.samples
samples_metadata = Base.classes.sample_metadata

#################################################
# Flask Routes

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/names")
def name_list():
    query_names = db.session.query(samples).statement
    df_names = pd.read_sql_query(query_names, db.session.bind)
    return jsonify(list(df_names.columns[2:]))

# 
@app.route("/samples/<sample>")
def func_samples(sample):
    # query for the emoji data using pandas
    query_statement = db.session.query(samples).statement
    df = pd.read_sql_query(query_statement, db.session.bind)
    sample_df = df.loc[df[sample]>=1,["otu_id","otu_label",sample]]
    sample_df.sort_values(by=[sample],ascending=False,inplace=True)
    sample_data = {
        "sample_values":sample_df[sample].values.tolist(),
        "otu_ids":sample_df["otu_id"].values.tolist(),
        "otu_labels":sample_df["otu_label"].values.tolist()
        }
    # format the trace for plotly
    # plot_trace = {
    #     "labels": sample_df["otu_id"].values.tolist(),
    #     "values": sample_df[sample].values.tolist(),
    #     "type": "pie",
    #     # "hoverinfo":'sample_df["otu_labels"].values.tolist() + percent'
    #     # "sample_df["otu_labels"].values.tolist()"
    # }
    return jsonify(sample_data)

@app.route("/metadata/<sample>")
def func_metadata(sample):
    query_metadata = db.session.query(samples_metadata.sample,
                                      samples_metadata.ETHNICITY,
                                      samples_metadata.AGE,
                                      samples_metadata.GENDER,
                                      samples_metadata.BBTYPE,
                                      samples_metadata.LOCATION).\
                                      filter(samples_metadata.sample == sample).all()

                                      
# create metadata_dict
    metadata_dict = {}
    for elem in query_metadata:
        metadata_dict["sample"] = elem[0]
        metadata_dict["ethnicity"] = elem[1]
        metadata_dict["age"] = elem[2]
        metadata_dict["gender"] = elem[3]
        metadata_dict["bbtype"] = elem[4]
        metadata_dict["location"] = elem[5]

    return jsonify(metadata_dict)

if __name__ == '__main__':
    app.run(debug=True)



  