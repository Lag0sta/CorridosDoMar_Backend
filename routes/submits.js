var express = require('express');
var router = express.Router();

const Submit = require('../models/submits');
const User = require('../models/users');

//route GET All submits listing. 
router.get('/', (req, res) => {
    Submit.find().then((data) => {
        res.json(data)

    })
})


//route POST new submits Song
router.post('/', async (req, res) => {

    try {

        if (!req.body.title || !req.body.mainText) {
            res.json({ result: false, error: 'fill the fields' })
            return
        }

        let secondaryTitle = req.body.secondaryTitle
        if (!secondaryTitle) {
            secondaryTitle = "unknown"
        }

        const submitData = await Submit.findOne({type: req.body.type, title: req.body.title })
        console.log("submitData", submitData)
        if (submitData) {
            res.json({ result: false, error: "title already used" });
            return
        } else {
            const newSubmit = new Submit({
                type: req.body.type,
                title: req.body.title,
                secondaryTitle: secondaryTitle,
                mainText: req.body.mainText,
                reasearchText: req.body.reasearchText,
                link: req.body.link,
                createdBy: req.body.createdBy,
                creationDate: Date.now(),
                latestUpdate: Date.now(),
                authorised: null
            });
            const data = await newSubmit.save()
            return res.json({
                result: true,
                type: data.type,
                title: data.title,
                secondaryTitle: data.secondaryTitle,
                mainText: data.mainText,
                reasearchText: data.reasearchText,
                link: data.link,
                createdBy: data.createdBy,
                creationDate: data.creationDate,
                latestUpdate: data.latestUpdate,
                authorised: data.authorised
            });


        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ result: false, error: error.message || 'error submitting' });
    }

})


router.post('/search', (req, res) => {
    if (!req.body.title) {
        res.json({ result: false, error: "fill the fields" });
    }
    if (req.body.title) {
        Submit.findOne({ title: req.body.title }).then((submitData) => {
            if (!submitData) {
                res.json({ result: false, error: "title not found" });
            }
            else {
                res.json(submitData)
            }
        }).catch((err) => {
            console.error(err);
            res.status(500).json({ result: false, error: "Erreur interne" });
        });

    }
})
// if(req.body.search){
//     const search = []
//     search.push(req.body.search)
//     for (let i = 0; i < search.length; i++) {
//         Submit.find({ textSearch: search[i] }).then((submitText) => {
//             res.json(submitText)
//         })
//     }
// }

// })

module.exports = router;
