import express from 'express';
import { Request, Response } from 'express';
import Submit from "../models/submits";
import User from '../models/users';


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

router.post('/mySubmits', async (req, res) => {

    try{

        const { accessToken } = req.body;

        if(!accessToken){
            res.json({result: false, error: "not authorised"})
            return
        }

        const userData = await User.findOne({accessToken: accessToken})

        if(!userData){
            res.json({result: false, error: "user not found"})
            return
        }

        const userID = userData._id

        const userSubmits = await Submit.find({createdBy: userID})

        if(!userSubmits){
            res.json({result: false, error: "no submits found"})
            return
        }

        res.json({result: true, userSubmits})
    }catch(error){
        console.error(error);
        res.status(500).json({ result: false, error: "Erreur interne" });
    }
})

router.put('/update', async (req: Request, res: Response) => {
  if (!req.body.accessToken) {
    res.json({ result: false, error: "not authorised" });
    return;
  }

  if (!req.body.title || !req.body.mainText) {
    res.json({ result: false, error: "fill the fields" });
    return;
  }

  try {
    const editSubmit = await Submit.findOneAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          title: req.body.title,
          secondaryTitle: req.body.secondaryTitle,
          secondaryType: req.body.secondaryType,
          mainText: req.body.mainText,
          links: req.body.links,
          latestUpdate: Date.now()
        }
      },
      { new: true }
    );

    if (!editSubmit) {
      res.json({ result: false, error: "document not found" });
      return;
    }

    res.json({ result: true, data: editSubmit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: "Erreur interne" });
  }
});

export default router