import { Component } from '@angular/core';
import { NavController, ActionSheetController, LoadingController } from 'ionic-angular';
import { Camera, PictureSourceType } from '@ionic-native/camera';
import * as Tesseract from 'tesseract.js'
import { NgProgress } from '@ngx-progressbar/core';
import { Observable} from 'rxjs/Observable';
import { HttpClient , HttpParams, HttpHeaders} from '@angular/common/http';
import { RequestOptions, RequestMethod} from '@angular/http';
import 'rxjs/add/operator/map';
 
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
 
  selectedImage: string;
  imageText: string;
  data: Observable<any>;
  translation: string;
  result :any = [];
  constructor(public navCtrl: NavController, 
    private camera: Camera, private actionSheetCtrl: ActionSheetController, 
    public progress: NgProgress,
    public http: HttpClient,
    public loadingCtrl: LoadingController) {
  }
 
  postData(word) : any{
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    let options = new RequestOptions({
      method: RequestMethod.Post,
      url: 'https://translate.yandex.net/api/v1.5/tr.json/translate'
    });
      const body = new HttpParams()
      .set('key', 'trnsl.1.1.20180922T053705Z.0d78979d80195386.d2e83d029b01851eb6645a08f572f8376f8d1341')
      .set('text', word)
      .set('lang', "tr-en");
    return this.http.post(options.url, body.toString(),  { headers, observe: 'response' })
    .subscribe(
                data => {
                  let fields = [];
                  Object.keys(data.body).map(d=>{
                    fields.push(data.body[d]);
                  });
                  this.imageText = fields[2];

                },
                err => {
                  alert("ERROR!: "+ JSON.stringify(err));
                }
            );
  }
 
  selectSource() {    
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Use Library',
          handler: () => {
            this.getPicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        }, {
          text: 'Capture Image',
          handler: () => {
            this.getPicture(this.camera.PictureSourceType.CAMERA);
          }
        }, {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }
 
  getPicture(sourceType: PictureSourceType) {
    this.camera.getPicture({
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: sourceType,
      allowEdit: true,
      saveToPhotoAlbum: false,
      correctOrientation: true
    }).then((imageData) => {
      this.selectedImage = `data:image/jpeg;base64,${imageData}`;
    });
  }
 
  recognizeImage() {
    Tesseract.recognize(this.selectedImage)
    .progress(message => {
      if (message.status === 'recognizing text')
      this.progress.set(message.progress);
    })
    .catch(err => console.error(err))
    .then(result => {
      // this.imageText = result.text;
      this.postData(result.text);
    })
    .finally(resultOrError => {
      this.progress.complete();
    });
  }
 
}