from flask import Flask, request
from flask_restful import Api, Resource, reqparse
from flask_cors import CORS, cross_origin
import numpy as np
import itertools
from scipy.sparse import csr_matrix
import pandas as pd
from scipy.cluster.hierarchy import ward, fcluster
from scipy.spatial.distance import squareform
from sklearn.manifold import TSNE, MDS

app = Flask(__name__)
CORS(app)
api = Api(app)

parser = reqparse.RequestParser()
parser.add_argument('keywords', action='append')
parser.add_argument('threshold', type=float)

papers = pd.read_csv("preprocessed-data/papers.csv")
papers_keywords = np.array(papers['Keywords'].apply(lambda x: x.split(";")))

def create_co_occurences_matrix(allowed_words, documents):
    word_to_id = dict(zip(allowed_words, range(len(allowed_words))))
    documents_as_ids = [np.sort([word_to_id[w] for w in doc if w in word_to_id]).astype('uint32') for doc in documents]
    row_ind, col_ind = zip(*itertools.chain(*[[(i, w) for w in doc] for i, doc in enumerate(documents_as_ids)]))
    data = np.ones(len(row_ind), dtype='uint32')
    max_word_id = max(itertools.chain(*documents_as_ids)) + 1
    docs_words_matrix = csr_matrix((data, (row_ind, col_ind)), shape=(len(documents_as_ids), max_word_id))
    words_cooc_matrix = docs_words_matrix.T * docs_words_matrix
    words_cooc_matrix.setdiag(0)
    return words_cooc_matrix 

class topicClustering(Resource):
    def post(self):
        args = parser.parse_args()

        keywords = np.array(args.keywords)
        threshold = args.threshold

        co_oc_matrix = create_co_occurences_matrix(keywords, papers_keywords)
        distance_mat = 1 - (co_oc_matrix / co_oc_matrix.max()).todense()
        np.fill_diagonal(distance_mat, 0)
        Z = ward(squareform(distance_mat))
        max = Z[:,2].max()
        topic_clusters = fcluster(Z, t=threshold*max, criterion='distance')
        topics = [list(np.unique(keywords[np.nonzero(topic_clusters==cluster_id)])) for cluster_id in np.unique(topic_clusters)]
        points = TSNE(metric='precomputed', square_distances=True).fit_transform(np.asarray(distance_mat))

        return {'topics':topics, 'points':points.tolist()}


api.add_resource(topicClustering, '/')

if __name__ == '__main__':
    print('starting api...')
    app.run(host='0.0.0.0')
    