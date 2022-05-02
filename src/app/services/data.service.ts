import { Injectable } from '@angular/core';
import { apiKey } from './api.key';
import { BehaviorSubject} from 'rxjs';
import {Face} from '../Face'

declare function require(name:string):any;
const msRest = require("@azure/ms-rest-js");
const AzureFace = require("@azure/cognitiveservices-face");

const endpoint:string = 'https://faceapi-clientside.cognitiveservices.azure.com/face/v1.0/detect?returnFaceAttributes=age.gender';
const credentials = new msRest.ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': apiKey } });
const client = new AzureFace.FaceClient(credentials, endpoint);

const testUrl: string = "https://csdx.blob.core.windows.net/resources/Face/Images/detection3.jpg";
@Injectable({providedIn: 'root'})
export class DataService {
    execChangeURL: BehaviorSubject<string> = new BehaviorSubject<string>(testUrl);
    execChangeFaces: BehaviorSubject<Face[]> = new BehaviorSubject<Face[]>([]);

    constructor() {}

    imageUrlChange(data: string) {
        this.execChangeURL.next(data);
    }

    changeFaces(data: Face[]){
        this.execChangeFaces.next(data);
    }

    async AddFacesToPersonGroup(person_dictionary:any, person_group_id:string) {
        const image_base_url: string = this.execChangeURL.getValue();

        console.log ("Adding faces to person group...");
        // The similar faces will be grouped into a single person group person.
        
        await Promise.all (Object.keys(person_dictionary).map (async function (key) {
            const value = person_dictionary[key];
    
            // Wait briefly so we do not exceed rate limits.
            await setTimeout(() => {}, 1000);
    
            let person = await client.personGroupPerson.create(person_group_id, { name : key });
            console.log("Create a person group person: " + key + ".");
    
            // Add faces to the person group person.
            await Promise.all (value.map (async function (similar_image:any) {
                // Check if the image is of sufficent quality for recognition.
                let sufficientQuality = true;
                let detected_faces = await client.face.detectWithUrl(image_base_url + similar_image,
                    {
                        returnFaceAttributes: ["QualityForRecognition"],
                        detectionModel: "detection_03",
                        recognitionModel: "recognition_03"
                    });
                detected_faces.forEach((detected_face:any) => {
                    if (detected_face.faceAttributes.qualityForRecognition != 'high'){
                        sufficientQuality = false;
                    }
                });
    
                // Quality is sufficent, add to group.
                if (sufficientQuality){
                    console.log("Add face to the person group person: (" + key + ") from image: " + similar_image + ".");
                    await client.personGroupPerson.addFaceFromUrl(person_group_id, person.personId, image_base_url + similar_image);
                }
            }));
        }));
    
        console.log ("Done adding faces to person group.");
    }

    async WaitForPersonGroupTraining(person_group_id:string) {
        // Wait so we do not exceed rate limits.
        console.log ("Waiting 10 seconds...");
        await setTimeout(() => {}, 1000);
        let result = await client.personGroup.getTrainingStatus(person_group_id);
        console.log("Training status: " + result.status + ".");
        if (result.status !== "succeeded") {
            await this.WaitForPersonGroupTraining(person_group_id);
        }
    }

    async IdentifyInPersonGroup() {
        const image_base_url: string = this.execChangeURL.getValue();

        console.log("========IDENTIFY FACES========");
        console.log();
    
    // Create a dictionary for all your images, grouping similar ones under the same key.
        const person_dictionary = {
            "Family1-Dad" : ["Family1-Dad1.jpg", "Family1-Dad2.jpg"],
            "Family1-Mom" : ["Family1-Mom1.jpg", "Family1-Mom2.jpg"],
            "Family1-Son" : ["Family1-Son1.jpg", "Family1-Son2.jpg"],
            "Family1-Daughter" : ["Family1-Daughter1.jpg", "Family1-Daughter2.jpg"],
            "Family2-Lady" : ["Family2-Lady1.jpg", "Family2-Lady2.jpg"],
            "Family2-Man" : ["Family2-Man1.jpg", "Family2-Man2.jpg"]
        };
    
        // A group photo that includes some of the persons you seek to identify from your dictionary.
        let source_image_file_name = "identification1.jpg";
    
        const person_group_id:string = "my-group-amani";
        // Create a person group. 
        console.log("Creating a person group with ID: " + person_group_id);
        await client.personGroup.create(person_group_id, JSON.stringify({ name : person_group_id, recognitionModel : "recognition_04" }))
    
        await this.AddFacesToPersonGroup(person_dictionary, person_group_id);
    
        // Start to train the person group.
        console.log();
        console.log("Training person group: " + person_group_id + ".");
        await client.personGroup.train(person_group_id);
    
        await this.WaitForPersonGroupTraining(person_group_id);
        console.log();
    
        // Detect faces from source image url and only take those with sufficient quality for recognition.
        let face_ids = (await client.face.DetectFaceRecognize(image_base_url + source_image_file_name)).map ((face:any) => face.faceId);
        // Identify the faces in a person group.
        let results = await client.face.identify(face_ids, { personGroupId : person_group_id});
        await Promise.all (results.map (async function (result:any) {
            let person = await client.personGroupPerson.get(person_group_id, result.candidates[0].personId);
            console.log("Person: " + person.name + " is identified for face in: " + source_image_file_name + " with ID: " + result.faceId + ". Confidence: " + result.candidates[0].confidence + ".");
        }));
        console.log();
    }

    faces: Face[] = [];
    async DetectFaceExtract(imageUrl: string) {
        console.log("========DETECT FACES========");
        console.log();

        const image_base_url: string = this.execChangeURL.getValue();

        let detected_faces = await client.face.detectWithUrl(image_base_url,
            {
                returnFaceAttributes: ["Accessories","Age","Blur","Emotion","Exposure","FacialHair","Glasses","Hair","HeadPose","Makeup","Noise","Occlusion","Smile","QualityForRecognition"],
                // We specify detection model 1 because we are retrieving attributes.
                detectionModel: "detection_01",
                recognitionModel: "recognition_03"
            });
        console.log (detected_faces.length + " face(s) detected from image .");
        console.log("Face attributes for face(s) in the image:");

        let counter: number = 1;
        this.faces = [];
        // Parse and print all attributes of each detected face.
        detected_faces.forEach (async (face:any) => {
            // Get the bounding box of the face
            console.log("Bounding box:\n  Left: " + face.faceRectangle.left + "\n  Top: " + face.faceRectangle.top + "\n  Width: " + face.faceRectangle.width + "\n  Height: " + face.faceRectangle.height);

            // Get the accessories of the face
            let accessories = face.faceAttributes.accessories.join();
            if (0 === accessories.length) {
                console.log ("No accessories detected.");
            }
            else {
                console.log ("Accessories: " + accessories);
            }

            // Get face other attributes
            console.log("Age: " + face.faceAttributes.age);
            console.log("Blur: " + face.faceAttributes.blur.blurLevel);

            // Get emotion on the face
            let emotions = "";
            let emotion_threshold = 0.0;
            if (face.faceAttributes.emotion.anger > emotion_threshold) { emotions += "anger, "; }
            if (face.faceAttributes.emotion.contempt > emotion_threshold) { emotions += "contempt, "; }
            if (face.faceAttributes.emotion.disgust > emotion_threshold) { emotions +=  "disgust, "; }
            if (face.faceAttributes.emotion.fear > emotion_threshold) { emotions +=  "fear, "; }
            if (face.faceAttributes.emotion.happiness > emotion_threshold) { emotions +=  "happiness, "; }
            if (face.faceAttributes.emotion.neutral > emotion_threshold) { emotions +=  "neutral, "; }
            if (face.faceAttributes.emotion.sadness > emotion_threshold) { emotions +=  "sadness, "; }
            if (face.faceAttributes.emotion.surprise > emotion_threshold) { emotions +=  "surprise, "; }
            if (emotions.length > 0) {
                emotions = emotions.slice (0, -2);
                console.log ("Emotions: " + emotions.slice (0, -2));
            }
            else {
                emotions = "No emotions detected.";
                console.log ("No emotions detected.");
            }
            
            // Get more face attributes
            console.log("Exposure: " + face.faceAttributes.exposure.exposureLevel);
            if (face.faceAttributes.facialHair.moustache + face.faceAttributes.facialHair.beard + face.faceAttributes.facialHair.sideburns > 0) {
                console.log("FacialHair: Yes");
            }
            else {
                console.log("FacialHair: No");
            }
            console.log("Glasses: " + face.faceAttributes.glasses);

            // Get hair color
            var color = "";
            if (face.faceAttributes.hair.hairColor.length === 0) {
                if (face.faceAttributes.hair.invisible) { color = "Invisible"; } else { color = "Bald"; }
            }
            else {
                color = "Unknown";
                var highest_confidence = 0.0;
                face.faceAttributes.hair.hairColor.forEach ((hair_color:any) => {
                    if (hair_color.confidence > highest_confidence) {
                        highest_confidence = hair_color.confidence;
                        color = hair_color.color;
                    }
                });
            }
            console.log("Hair: " + color);

            // Get more attributes
            console.log("Head pose:");
            console.log("  Pitch: " + face.faceAttributes.headPose.pitch);
            console.log("  Roll: " + face.faceAttributes.headPose.roll);
            console.log("  Yaw: " + face.faceAttributes.headPose.yaw);

            console.log("Makeup: " + ((face.faceAttributes.makeup.eyeMakeup || face.faceAttributes.makeup.lipMakeup) ? "Yes" : "No"));
            console.log("Noise: " + face.faceAttributes.noise.noiseLevel);

            console.log("Occlusion:");
            console.log("  Eye occluded: " + (face.faceAttributes.occlusion.eyeOccluded ? "Yes" : "No"));
            console.log("  Forehead occluded: " + (face.faceAttributes.occlusion.foreheadOccluded ? "Yes" : "No"));
            console.log("  Mouth occluded: " + (face.faceAttributes.occlusion.mouthOccluded ? "Yes" : "No"));

            console.log("Smile: " + face.faceAttributes.smile);
            
            console.log("QualityForRecognition: " + face.faceAttributes.qualityForRecognition)
            console.log();

            const newFace: Face = {id: counter, 
                                   age: face.faceAttributes.age,
                                   emotion: emotions}
            this.faces.push(newFace);
            this.changeFaces(this.faces);

            counter++;
        });
    }
}
