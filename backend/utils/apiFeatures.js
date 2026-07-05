// utils/apiFeatures.js
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }


    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 2;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }

    search() {
        const search = this.queryString.search?.trim();
        if (search) {
            this.query = this.query.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            });
        }
        return this;
    }

}

module.exports = APIFeatures;
