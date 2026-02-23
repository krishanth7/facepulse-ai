export const loadModels = async () => {
  const faceapi = await import('@vladmandic/face-api');
  const MODEL_URL = 'https://vladmandic.github.io/face-api/model/';
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    ]);
    console.log('AI Models Loaded Successfully');
    return true;
  } catch (error) {
    console.error('Error loading models:', error);
    return false;
  }
};
