import React, { useState, useEffect } from "react";
import { Button, Form, FormGroup, Label, Input, Col } from "reactstrap";
import { useHistory, useParams } from "react-router-dom";
import { Link } from "react-router-dom";

export const PostForm = () => {
  const [categories, setCategories] = useState([]);
  const [filteredcategories, setFilteredCategories] = useState([]);
  const [post, setPost] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const { postId } = useParams();
  const history = useHistory();
  const user = JSON.parse(localStorage.getItem("userProfile"));

  //get post
  const getPostbyId = () => {
    fetch(`/api/post/${postId}`)
      .then((res) => {
        if (res.status === 404) {
          history.push("/");
        }
        return res.json();
      })
      .then((data) => {
        setPost(data.post);
      });
  };

  useEffect(() => {
    if (postId) {
      getPostbyId();
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [postId]);

  //get categories
  useEffect(() => {
    fetch("/api/post/getallcategories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
      });
  }, []);

  //get all active categories
  useEffect(() => {
    const subset = categories.filter((c) => c.isActive === true);
    setFilteredCategories(subset);
  }, [categories]);

  //add post
  const addPost = (post) => {
    return fetch("/api/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post),
    });
  };

  //update post
  const updatePost = (post) => {
    return fetch(`/api/post/${post.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post),
    });
  };

  //when field changes, update state. This causes a re-render and updates the view.
  //Controlled component
  const handleControlledInputChange = (event) => {
    const newPost = { ...post };
    newPost[event.target.name] = event.target.value;
    setPost(newPost);
  };

  const handleClickNewPost = (e) => {
    if (parseInt(post.categoryId) === 0) {
      e.preventDefault();
      window.alert("enter categoy");
    } else {
      if (postId) {
        debugger;
        updatePost({
          id: post.id,
          title: post.title,
          content: post.content,
          imageLocation: post.imageLocation,
          publishDateTime: post.publishDateTime,
          IsApproved: false,
          userProfileId: parseInt(user.id),
          categoryId: post.categoryId,
        }).then(() => history.push("/mypost"));
      } else {
        addPost({
          title: post.title,
          content: post.content,
          imageLocation: post.imageLocation,
          publishDateTime: post.publishDateTime,
          IsApproved: false,
          userProfileId: parseInt(user.id),
          categoryId: post.categoryId,
        }).then(() => history.push("/mypost"));
      }
    }
    setIsLoading(true);
  };

  if (post?.id) {
    //the post does not belong to the user
    if (post?.userProfileId !== parseInt(user.id)) {
      return (
        //the post does not belong to the user
        <>
          <h1>This is not your post to edit</h1>
          <Button>
            <Link to={"/mypost"}>Go Back</Link>
          </Button>
        </>
      );
    }
  }

  return (
    <div className="container border border-dark mt-5">
      <Form className="p-5" onSubmit={handleClickNewPost}>
        {postId ? <h2>Edit Post</h2> : <h2>Create A New Post</h2>}
        <FormGroup className="form-group" row>
          <Label for="title" sm={2}>
            Title
          </Label>
          <Col sm={10}>
            <Input
              type="text"
              id="postTitle"
              name="title"
              autoFocus
              className="form-control"
              onChange={handleControlledInputChange}
              required="required"
              defaultValue={post?.title}
            />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label for="exampleSelect" sm={2}>
            Category
          </Label>
          <Col sm={10}>
            <Input
              type="select"
              name="categoryId"
              onChange={handleControlledInputChange}
              required="required"
              value={post?.categoryId}
            >
              <option value="0"></option>
              {filteredcategories.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </Input>
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label for="title" sm={2}>
            Publishing Date
          </Label>
          <Col sm={10}>
            <Input
              type="date"
              name="publishDateTime"
              onChange={handleControlledInputChange}
              required="required"
              //defaultValue={post?.publishDateTime.split("T")[0]}
            />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label for="exampleFile" sm={2}>
            Header Image
          </Label>
          <Col sm={10}>
            <Input
              type="file"
              name="imageLocation"
              onChange={handleControlledInputChange}
              defaultValue={post?.imageLocation}
            />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label for="content" sm={2}>
            Body
          </Label>
          <Col sm={10}>
            <Input
              type="textarea"
              name="content"
              required="required"
              onChange={handleControlledInputChange}
              defaultValue={post?.content}
            />
          </Col>
        </FormGroup>
        <Button type="submit" block color="danger" disabled={isLoading}>
          Submit
        </Button>
      </Form>
    </div>
  );
};