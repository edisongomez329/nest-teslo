export const FileFilter = (req: Express.Request, file: Express.Multer.File, callBack: Function) => {

    console.log('InFileFilter');
    console.log( {inFileFilter: file});

    if(!file) {
        return callBack(new Error('File is empty'), false)
    }

    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg','jpeg','png','gif'];
    if(validExtensions.includes(fileExtension)){
        callBack(null, true);    
    } 


    callBack(null, false);

}