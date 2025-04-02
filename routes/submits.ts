import express from 'express';
import { Request, Response } from 'express';
import Submit from "../models/submits";


const router = express.Router();


//route GET All submits listing. 
router.get('/', (req, res) => {
    Submit.find().then((data) => {
        res.json(data)

    })
})


//route POST new submits 
router.post('/', async (req: Request, res: Response): Promise<void> => { 

    try {

        if (!req.body.title || !req.body.mainText) {
            res.json({ result: false, error: 'fill the fields' })
            return
        }

        let secondaryTitle: string = req.body.secondaryTitle
        if (!secondaryTitle) {
            secondaryTitle = "unknown"
        }

        const submitData = await Submit.findOne({ type: req.body.type, title: req.body.title })
        console.log("submitData", submitData)
        if (submitData) {
            res.json({ result: false, error: "title already used" });
            return
        } else {

            const newSubmit = new Submit({
                type: req.body.type,
                title: req.body.title,
                secondaryTitle: secondaryTitle || "unknown",
                secondaryType: req.body.secondaryType,
                mainText: req.body.mainText,
                reasearchText: req.body.reasearchText,
                links: req.body.links ,
                createdBy: req.body.createdBy,
                creationDate: Date.now(),
                latestUpdate: Date.now(),
                authorised: null
            });
            const data = await newSubmit.save()
            res.json({
                result: true,
                type: data.type,
                title: data.title,
                secondaryTitle: data.secondaryTitle,
                secondaryType: data.secondaryType,
                mainText: data.mainText,
                links: data.links,
                createdBy: data.createdBy,
                creationDate: data.creationDate,
                latestUpdate: data.latestUpdate,
                authorised: data.authorised
            });
        
        }
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ result: false, error: error.message || 'error submitting' });
    }

})

router.post('/search', async (req, res) => {

    try {
        if (!req.body.title) {
          res.json({ result: false, error: "fill the fields" });
        }
        if (req.body.title) {
          const searchData = await Submit.findOne({ title: req.body.title });
          if (!searchData) {
            res.json({ result: false, error: "title not found" });
          } else {
            res.json(searchData);
          }
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ result: false, error: "Erreur interne" });
      }
})


export default router