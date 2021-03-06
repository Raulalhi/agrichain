import { Component, OnInit, ViewChild } from "@angular/core";
import {
  NavController,
  IonSelect,
  ToastController,
  AlertController,
  Events
} from "@ionic/angular";
import { DataService } from "../services/data.service";
import { Batch } from "../interfaces/batch";
import { ShareService } from "../services/share.service";

@Component({
  selector: "app-tab1",
  templateUrl: "tab1.page.html",
  styleUrls: ["tab1.page.scss"]
})
export class Tab1Page implements OnInit {
  batches: Batch[];
  errorMessage;
  ext: String = "Batch";
  storages;
  notAllocatedBatches;
  storageSelected;
  batchToBeMoved;

  imgs = [
    "assets/aubergine.jpg",
    "assets/cucumber.jpg",
    "assets/pepper.jpg",
    "assets/tomato.jpg",
    "assets/watermelon.jpg"
  ];

  @ViewChild("roomSelect") selectRef: IonSelect;

  constructor(
    public shareService: ShareService,
    public navCtrl: NavController,
    private dataService: DataService,
    private toastController: ToastController,
    public alertController: AlertController
  ) {}

  ngOnInit() {
    this.getBatches();
    this.storages = ["Storage 1", "Storage 2", "Storage 3"];
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: "Batch Moved",
      duration: 3000,
      position: "top"
    });
    toast.present();
  }

  async getBatches() {
    this.dataService
      .getData(this.ext)
      .toPromise()
      .then(data => {
        this.dataService.dismissLoadng();
        this.batches = JSON.parse(JSON.stringify(data));

        this.parseBatch();
        this.getCrops();
        this.shareService.pushData(this.batches);

        this.storages = this.batches
          .map(batch => batch.storage)
          .filter(value => value != "")
          .filter((value, index, self) => self.indexOf(value) === index);
        this.storages.sort();

        this.storages = ["Storage 1", "Storage 2", "Storage 3"];

        this.notAllocatedBatches = this.batches.filter(
          batch => batch.storage === ""
        );
      })
      .catch(error => {
        if (error === "Server error") {
          this.errorMessage =
            "Could not connect to REST server. Please check your configuration details";
        } else if (error === "404 - Not Found") {
          this.errorMessage =
            "404 - Could not find API route. Please check your available APIs.";
        } else {
          this.errorMessage = error;
          console.log(error);
        }
      });
  }

  getCrops() {
    this.dataService
      .getData("Crop")
      .toPromise()
      .then(data => {
        this.dataService.dismissLoadng();
        data.forEach(crop => {
          var index2 = crop.owner.indexOf("#") + 1;
          var parsedFarmer = decodeURI(crop.owner.slice(index2));

          this.batches.forEach(batch => {
            if (batch.crop == crop.cropID) {
              batch.crop = crop;
              batch.crop.owner = parsedFarmer;

              switch (batch.crop.type) {
                case "Aubergine":
                  batch.img = this.imgs[0];
                  break;
                case "Cucumber":
                  batch.img = this.imgs[1];
                  break;
                case "Pepper":
                  batch.img = this.imgs[2];
                  break;
                case "Tomato":
                  batch.img = this.imgs[3];
                  break;
                case "Watermelon":
                  batch.img = this.imgs[4];
                  break;
                default:
                  console.log("NONE");
              }
            }
          });
        });
      });
  }

  parseBatch() {
    var index1 = this.batches[0].crop.indexOf("#") + 1;

    this.batches.forEach(batch => {
      var parsedCrop = batch.crop.slice(index1);
      batch.crop = decodeURI(parsedCrop);
    });

    this.notAllocatedBatches = this.batches
      .map(batch => batch.storage)
      .filter(value => value === "");
  }

  filterBatches(storage) {
    return this.batches.filter(b => b.storage === storage);
  }

  openSelect(batch) {
    this.batchToBeMoved = batch;
    this.selectRef.open();
  }

  onStorageSelected() {
    if (this.selectRef.value === undefined) return;

    this.presentAlertPrompt();
  }

  async presentAlertPrompt() {
    const alert = await this.alertController.create({
      header: "Enter Batch's Weight",
      inputs: [
        {
          name: "weight",
          type: "number",
          placeholder: "Kgs"
        }
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            console.log("Confirm Cancel");
          }
        },
        {
          text: "Ok",
          handler: data => {
            this.batchToBeMoved.size = data.weight;
            this.batchToBeMoved.storage = this.selectRef.value;
            var index = this.notAllocatedBatches.indexOf(this.batchToBeMoved);
            if (index > -1) {
              this.notAllocatedBatches.splice(index, 1);
            }

            var alteredBatch = {
              batch: this.batchToBeMoved.batchID,
              weight: data.weight,
              storage: this.selectRef.value
            };

            this.dataService
              .addAsset("processBatch", alteredBatch)
              .toPromise()
              .then(() => {
                this.dataService.dismissLoadng();
                this.presentToast();
                this.errorMessage = null;
              })
              .catch(error => {
                if (error === "Server error") {
                  this.errorMessage =
                    "Could not connect to REST server. Please check your configuration details";
                } else {
                  this.errorMessage = error;
                }
              });
            this.selectRef.value = undefined;
          }
        }
      ]
    });

    await alert.present();
  }
}
